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

function main() {
    const rootDir = path.join(__dirname, '..');
    const luaPath = path.join(rootDir, 'AndyWatchlist.lua');
    const htmlPath = path.join(rootDir, 'docs', 'index.html');
    
    console.log('📖 Reading AndyWatchlist.lua...');
    const luaContent = fs.readFileSync(luaPath, 'utf8');
    
    console.log('🔍 Parsing watchlist data...');
    const watchlistData = parseLuaWatchlist(luaContent);
    
    console.log(`✅ Found ${Object.keys(watchlistData.addons).length} addon(s) and ${Object.keys(watchlistData.authors).length} author(s)`);
    
    console.log('📝 Updating docs/index.html...');
    updateHtmlWithWatchlist(htmlPath, watchlistData);
    
    console.log('✨ Done! docs/index.html has been updated with the latest watchlist data.');
}

if (require.main === module) {
    main();
}

module.exports = { parseLuaWatchlist, updateHtmlWithWatchlist };
