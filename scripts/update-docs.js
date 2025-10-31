#!/usr/bin/env node
/**
 * Updates docs/index.html with the latest watchlist data from AndyWatchlist.lua
 */

const fs = require('fs');
const path = require('path');

function parseLuaWatchlist(luaContent) {
    const watchlistData = {
        addons: {},
        authors: {}
    };

    // Parse AddonWatchlistDb
    const addonDbMatch = luaContent.match(/Andy\.AddonWatchlistDb\s*=\s*{([\s\S]*?)^}/m);
    if (addonDbMatch) {
        const addonContent = addonDbMatch[1];
        
        // Match each addon entry (but not commented ones)
        // Updated pattern to handle multi-line entries with inline comments
        const addonPattern = /(?:^|\n)\s*(\["[^"]+"\]\s*=\s*\{[\s\S]*?\n\s*\})/gm;
        let match;
        
        while ((match = addonPattern.exec(addonContent)) !== null) {
            const entry = match[1];
            
            // Skip if this line is commented
            const lineStart = addonContent.lastIndexOf('\n', match.index) + 1;
            const beforeEntry = addonContent.substring(lineStart, match.index);
            if (beforeEntry.trim().startsWith('--')) continue;
            
            // Extract name and content
            const entryMatch = entry.match(/\["([^"]+)"\]\s*=\s*\{([\s\S]*?)\}/);
            if (!entryMatch) continue;
            
            const name = entryMatch[1];
            const content = entryMatch[2];
            
            // Parse fields
            const reasonMatch = content.match(/reason\s*=\s*"([^"]+)"/);
            const descMatch = content.match(/description\s*=\s*"([^"]+)"/);
            const authorMatch = content.match(/author\s*=\s*"([^"]+)"/);
            const allVersionsMatch = content.match(/allVersions\s*=\s*(true|false)/);
            const versionsMatch = content.match(/versions\s*=\s*{([^}]+)}/);
            const platformMatch = content.match(/platform\s*=\s*"([^"]+)"/);
            const dateMatch = content.match(/reportedDate\s*=\s*"([^"]+)"/);
            
            watchlistData.addons[name] = {
                reason: reasonMatch ? reasonMatch[1] : 'unknown',
                description: descMatch ? descMatch[1] : '',
                allVersions: allVersionsMatch ? allVersionsMatch[1] === 'true' : false,
                platform: platformMatch ? platformMatch[1] : 'both',
                reportedDate: dateMatch ? dateMatch[1] : ''
            };
            
            // Add optional author field
            if (authorMatch) {
                watchlistData.addons[name].author = authorMatch[1];
            }
            
            if (versionsMatch) {
                const versions = versionsMatch[1]
                    .split(',')
                    .map(v => v.trim().replace(/["']/g, ''))
                    .filter(v => v);
                if (versions.length > 0) {
                    watchlistData.addons[name].versions = versions;
                }
            }
        }
    }

    // Parse AuthorWatchlistDb
    const authorDbMatch = luaContent.match(/Andy\.AuthorWatchlistDb\s*=\s*{([\s\S]*?)^}/m);
    if (authorDbMatch) {
        const authorContent = authorDbMatch[1];
        
        // Match each author entry (but not commented ones)
        // Updated pattern to handle multi-line entries with inline comments
        const authorPattern = /(?:^|\n)\s*(\["[^"]+"\]\s*=\s*\{[\s\S]*?\n\s*\})/gm;
        let match;
        
        while ((match = authorPattern.exec(authorContent)) !== null) {
            const entry = match[1];
            
            // Skip if this line is commented
            const lineStart = authorContent.lastIndexOf('\n', match.index) + 1;
            const beforeEntry = authorContent.substring(lineStart, match.index);
            if (beforeEntry.trim().startsWith('--')) continue;
            
            // Extract name and content
            const entryMatch = entry.match(/\["([^"]+)"\]\s*=\s*\{([\s\S]*?)\}/);
            if (!entryMatch) continue;
            
            const name = entryMatch[1];
            const content = entryMatch[2];
            
            // Parse fields
            const reasonMatch = content.match(/reason\s*=\s*"([^"]+)"/);
            const descMatch = content.match(/description\s*=\s*"([^"]+)"/);
            const platformMatch = content.match(/platform\s*=\s*"([^"]+)"/);
            const dateMatch = content.match(/reportedDate\s*=\s*"([^"]+)"/);
            
            watchlistData.authors[name] = {
                reason: reasonMatch ? reasonMatch[1] : 'unknown',
                description: descMatch ? descMatch[1] : '',
                platform: platformMatch ? platformMatch[1] : 'both',
                reportedDate: dateMatch ? dateMatch[1] : ''
            };
        }
    }

    return watchlistData;
}

function updateHtmlWithWatchlist(htmlPath, watchlistData) {
    let html = fs.readFileSync(htmlPath, 'utf8');
    
    // Find and replace the watchlistData object in the HTML
    const watchlistDataString = JSON.stringify(watchlistData, null, 12);
    
    // Replace only the watchlistData declaration, stopping before const reasonLabels
    // Updated to handle both Unix and Windows line endings
    html = html.replace(
        /const watchlistData = \{[\s\S]*?\r?\n\s*\};(?=\r?\n\r?\n\s+const reasonLabels)/,
        `const watchlistData = ${watchlistDataString};`
    );
    
    fs.writeFileSync(htmlPath, html, 'utf8');
}

function parseVersionInfo(txtContent) {
    const versionMatch = txtContent.match(/##\s*Version:\s*(.+)/);
    const apiMatch = txtContent.match(/##\s*APIVersion:\s*(\d+)/);
    
    return {
        version: versionMatch ? versionMatch[1].trim() : 'Unknown',
        apiVersion: apiMatch ? apiMatch[1].trim() : 'Unknown'
    };
}

function parseUpdates(updatesPath) {
    try {
        const updatesContent = fs.readFileSync(updatesPath, 'utf8');
        return JSON.parse(updatesContent);
    } catch (error) {
        console.warn('⚠️  Could not read updates.json, using empty array');
        return [];
    }
}

function parseAudits(auditsDir) {
    const audits = {
        console: [],
        pc: []
    };

    try {
        // Parse console audits
        const consolePath = path.join(auditsDir, 'console');
        if (fs.existsSync(consolePath)) {
            const consoleFiles = fs.readdirSync(consolePath).filter(f => f.endsWith('.json'));
            consoleFiles.forEach(file => {
                try {
                    const content = fs.readFileSync(path.join(consolePath, file), 'utf8');
                    const audit = JSON.parse(content);
                    audits.console.push(audit);
                } catch (err) {
                    console.warn(`⚠️  Could not parse ${file}:`, err.message);
                }
            });
        }

        // Parse PC audits
        const pcPath = path.join(auditsDir, 'pc');
        if (fs.existsSync(pcPath)) {
            const pcFiles = fs.readdirSync(pcPath).filter(f => f.endsWith('.json'));
            pcFiles.forEach(file => {
                try {
                    const content = fs.readFileSync(path.join(pcPath, file), 'utf8');
                    const audit = JSON.parse(content);
                    audits.pc.push(audit);
                } catch (err) {
                    console.warn(`⚠️  Could not parse ${file}:`, err.message);
                }
            });
        }
    } catch (error) {
        console.warn('⚠️  Could not read audits directory:', error.message);
    }

    return audits;
}

function updateHtmlWithVersionInfo(htmlPath, versionInfo) {
    let html = fs.readFileSync(htmlPath, 'utf8');
    
    // Replace version in the version display section
    // Updated to handle both Unix and Windows line endings
    html = html.replace(
        /const versionInfo = \{[\s\S]*?\r?\n\s*\};(?=\r?\n)/,
        `const versionInfo = ${JSON.stringify(versionInfo, null, 12)};`
    );
    
    fs.writeFileSync(htmlPath, html, 'utf8');
}

function updateHtmlWithUpdates(htmlPath, updates) {
    let html = fs.readFileSync(htmlPath, 'utf8');
    
    // Replace updates array
    // Updated to handle both Unix and Windows line endings
    html = html.replace(
        /const updatesData = \[[\s\S]*?\r?\n\s*\];(?=\r?\n)/,
        `const updatesData = ${JSON.stringify(updates, null, 12)};`
    );
    
    fs.writeFileSync(htmlPath, html, 'utf8');
}

function updateHtmlWithAudits(htmlPath, audits) {
    let html = fs.readFileSync(htmlPath, 'utf8');
    
    // Replace audits object
    // Updated to handle both Unix and Windows line endings
    html = html.replace(
        /const auditsData = \{[\s\S]*?\r?\n\s*\};(?=\r?\n)/,
        `const auditsData = ${JSON.stringify(audits, null, 12)};`
    );
    
    fs.writeFileSync(htmlPath, html, 'utf8');
}

function main() {
    const rootDir = path.join(__dirname, '..');
    const luaPath = path.join(rootDir, 'AndyWatchlist.lua');
    const txtPath = path.join(rootDir, 'Andy.txt');
    const updatesPath = path.join(rootDir, 'docs', 'updates', 'updates.json');
    const auditsDir = path.join(rootDir, 'docs', 'audits');
    const htmlPath = path.join(rootDir, 'docs', 'index.html');
    
    console.log('📖 Reading AndyWatchlist.lua...');
    const luaContent = fs.readFileSync(luaPath, 'utf8');
    
    console.log('🔍 Parsing watchlist data...');
    const watchlistData = parseLuaWatchlist(luaContent);
    
    console.log(`✅ Found ${Object.keys(watchlistData.addons).length} addon(s) and ${Object.keys(watchlistData.authors).length} author(s)`);
    
    console.log('📖 Reading Andy.txt for version info...');
    const txtContent = fs.readFileSync(txtPath, 'utf8');
    const versionInfo = parseVersionInfo(txtContent);
    
    console.log(`📦 Version: ${versionInfo.version}, API: ${versionInfo.apiVersion}`);
    
    console.log('📰 Reading updates.json...');
    const updates = parseUpdates(updatesPath);
    
    console.log(`📢 Found ${updates.length} update(s)`);
    
    console.log('🔒 Reading audit files...');
    const audits = parseAudits(auditsDir);
    
    console.log(`✅ Found ${audits.console.length} console audit(s) and ${audits.pc.length} PC audit(s)`);
    
    console.log('📝 Updating docs/index.html...');
    updateHtmlWithWatchlist(htmlPath, watchlistData);
    updateHtmlWithVersionInfo(htmlPath, versionInfo);
    updateHtmlWithUpdates(htmlPath, updates);
    updateHtmlWithAudits(htmlPath, audits);
    
    console.log('✨ Done! docs/index.html has been updated with the latest data.');
}

if (require.main === module) {
    main();
}

module.exports = { parseLuaWatchlist, updateHtmlWithWatchlist };
