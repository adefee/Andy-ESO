const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

// Get version from package.json
const packageJson = require('./package.json');
const version = packageJson.version;

// Ensure dist directory exists
const distDir = path.join('dist', version);
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Output file path
const outputZip = path.join(distDir, `addonanalyzer-${version}.zip`);

// Files/folders to exclude from the build
// Only include files necessary for the addon to run in ESO
const excludePatterns = [
  // Development & Build
  'node_modules',
  'dist',
  'build.js',
  'prep-release.js',
  
  // Version Control
  '.git',
  '.github',
  '.gitignore',
  '.gitattributes',
  
  // Documentation & Metadata
  'README.md',
  
  // Package Management
  'package.json',
  'package-lock.json',
  
  // Assets (screenshots, logos - not needed in-game)
  'images',
  
  // IDE & Editor
  '.vscode',
  
  // Legacy/Sample Files
  'sample_saved_variables_pre_804000.lua',
  
  // Deployment (if exists)
  'deploy',
  '.deploy-exclude',
  'build-temp.ps1'
];

/**
 * Check if a file/folder should be included in the build
 */
function shouldInclude(itemPath) {
  const itemName = path.basename(itemPath);
  return !excludePatterns.includes(itemName);
}

/**
 * Build the addon archive using archiver library
 * This creates a standard zip file compatible with all platforms and tools like Minion
 * 
 * Includes only runtime-essential files:
 * - *.lua files (addon code)
 * - *.xml files (UI definitions)
 * - AddonAnalyzer.txt (manifest)
 * - bindings.xml (keybindings)
 * - LICENSE (license file)
 */
async function buildArchive() {
  console.log('Building archive...');
  console.log(`Version: ${version}`);
  console.log(`Output: ${outputZip}`);
  console.log(`\n📦 Creating slim build (runtime files only)...`);
  
  // Remove existing zip if it exists
  if (fs.existsSync(outputZip)) {
    fs.unlinkSync(outputZip);
  }
  
  return new Promise((resolve, reject) => {
    // Create a write stream for the output file
    const output = fs.createWriteStream(outputZip);
    
    // Create archiver instance with standard deflate compression
    // Using level 9 for maximum compatibility and compression
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });
    
    // Handle completion
    output.on('close', () => {
      const stats = fs.statSync(outputZip);
      const sizeKB = (stats.size / 1024).toFixed(2);
      const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
      console.log(`\n✓ Successfully created ${path.basename(outputZip)}`);
      console.log(`  Size: ${sizeKB} KB (${sizeMB} MB)`);
      console.log(`  Total bytes: ${archive.pointer()}`);
      resolve();
    });
    
    // Handle warnings
    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        console.warn('Warning:', err);
      } else {
        reject(err);
      }
    });
    
    // Handle errors
    archive.on('error', (err) => {
      reject(err);
    });
    
    // Pipe archive data to the output file
    archive.pipe(output);
    
    // Get all items in the current directory
    const items = fs.readdirSync('.');
    
    console.log('\nProcessing files:');
    
    let includedCount = 0;
    let excludedCount = 0;
    const includedItems = [];
    const excludedItems = [];
    
    // Add each item to the archive under the "AddonAnalyzer" directory
    for (const item of items) {
      if (shouldInclude(item)) {
        const itemPath = path.join('.', item);
        const stats = fs.statSync(itemPath);
        
        if (stats.isDirectory()) {
          console.log(`  ✓ ${item}/ (directory)`);
          archive.directory(itemPath, path.join('AddonAnalyzer', item));
          includedItems.push(item + '/');
        } else {
          console.log(`  ✓ ${item}`);
          archive.file(itemPath, { name: path.join('AddonAnalyzer', item) });
          includedItems.push(item);
        }
        includedCount++;
      } else {
        console.log(`  ✗ ${item} (excluded)`);
        excludedItems.push(item);
        excludedCount++;
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`  Included: ${includedCount} items`);
    console.log(`  Excluded: ${excludedCount} items`);
    
    // Finalize the archive
    console.log('\nFinalizing archive...');
    archive.finalize();
  });
}

// Main execution
(async () => {
  try {
    await buildArchive();
    console.log('\n🎉 Build completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Build failed:', error.message);
    console.error(error);
    process.exit(1);
  }
})();
