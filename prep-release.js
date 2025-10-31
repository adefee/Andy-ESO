#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.cyan}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  header: (msg) => console.log(`\n${colors.bright}${msg}${colors.reset}\n`),
};

/**
 * Parse command line arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    version: null,
    commit: false,
    tag: false,
    push: false,
    help: false,
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--commit' || arg === '-c') {
      options.commit = true;
    } else if (arg === '--tag' || arg === '-t') {
      options.tag = true;
      options.commit = true; // Tag requires commit
    } else if (arg === '--push' || arg === '-p') {
      options.push = true;
      options.tag = true; // Push requires tag
      options.commit = true; // Push requires commit
    } else if (!options.version && /^\d+\.\d+\.\d+$/.test(arg)) {
      options.version = arg;
    } else {
      log.error(`Unknown argument: ${arg}`);
      options.help = true;
    }
  }

  return options;
}

/**
 * Display help message
 */
function showHelp() {
  console.log(`
${colors.bright}Andy - ESO Addon Analyzer - Version Management Script${colors.reset}

${colors.bright}Usage:${colors.reset}
  npm run prep-release -- <version> [options]
  node prep-release.js <version> [options]

${colors.yellow}Note: When using npm run, the '--' is required before arguments!${colors.reset}

${colors.bright}Arguments:${colors.reset}
  <version>       Version number in format X.Y.Z (e.g., 8.4.0)

${colors.bright}Options:${colors.reset}
  -h, --help      Show this help message
  -c, --commit    Commit the version changes to git
  -t, --tag       Create a git tag (implies --commit)
  -p, --push      Push commit and tag to remote (implies --tag and --commit)

${colors.bright}Examples:${colors.reset}
  # Update version files only
  npm run prep-release -- 8.5.0

  # Update version and commit changes
  npm run prep-release -- 8.5.0 --commit

  # Update version, commit, and create tag
  npm run prep-release -- 8.5.0 --tag

  # Complete release: update, commit, tag, and push
  npm run prep-release -- 8.5.0 --push

  # Running directly (no '--' needed)
  node prep-release.js 8.5.0 --push

${colors.bright}Files Updated:${colors.reset}
  - package.json
  - AddonAnalyzer.txt (Version and AddOnVersion)
  - variables.lua (version and versionESO)
  - README.md (Current Branch Release)

${colors.bright}Notes:${colors.reset}
  - Version must follow semantic versioning: MAJOR.MINOR.PATCH
  - AddOnVersion is calculated as: MAJOR*100000 + MINOR*1000 + PATCH*100
  - Git operations require a clean working directory
  - Use --push only when you're ready to trigger the GitHub Actions release
`);
}

/**
 * Validate semantic version format
 */
function validateVersion(version) {
  if (!version) {
    log.error('Version number is required');
    return false;
  }

  const semverRegex = /^(\d+)\.(\d+)\.(\d+)$/;
  if (!semverRegex.test(version)) {
    log.error('Invalid version format. Use semantic versioning: X.Y.Z (e.g., 8.4.0)');
    return false;
  }

  return true;
}

/**
 * Calculate ESO addon version number
 * Format: MAJOR*100000 + MINOR*1000 + PATCH*100
 * Example: 8.4.0 => 804000
 */
function calculateAddonVersion(version) {
  const [major, minor, patch] = version.split('.').map(Number);
  return major * 100000 + minor * 1000 + patch * 100;
}

/**
 * Check if git working directory is clean
 */
function isGitClean() {
  try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    return status.trim() === '';
  } catch (error) {
    log.warning('Unable to check git status. Is this a git repository?');
    return false;
  }
}

/**
 * Update package.json
 */
function updatePackageJson(version) {
  const packagePath = path.join(__dirname, 'package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
  
  const oldVersion = packageJson.version;
  packageJson.version = version;
  
  fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2) + '\n');
  log.success(`Updated package.json: ${oldVersion} → ${version}`);
}

/**
 * Update AddonAnalyzer.txt manifest
 */
function updateAndyTxt(version) {
  const txtPath = path.join(__dirname, 'Andy.txt');
  let content = fs.readFileSync(txtPath, 'utf8');
  
  const addonVersion = calculateAddonVersion(version);
  
  // Update Version line
  const oldVersionMatch = content.match(/## Version: ([\d.]+)/);
  const oldVersion = oldVersionMatch ? oldVersionMatch[1] : 'unknown';
  content = content.replace(/## Version: [\d.]+/, `## Version: ${version}`);
  
  // Update AddOnVersion line
  const oldAddonVersionMatch = content.match(/## AddOnVersion: (\d+)/);
  const oldAddonVersion = oldAddonVersionMatch ? oldAddonVersionMatch[1] : 'unknown';
  content = content.replace(/## AddOnVersion: \d+/, `## AddOnVersion: ${addonVersion}`);
  
  fs.writeFileSync(txtPath, content);
  log.success(`Updated Andy.txt:`);
  log.info(`  Version: ${oldVersion} → ${version}`);
  log.info(`  AddOnVersion: ${oldAddonVersion} → ${addonVersion}`);
}

/**
 * Update variables.lua
 */
function updateVariablesLua(version) {
  const luaPath = path.join(__dirname, 'AndyVariables.lua');
  let content = fs.readFileSync(luaPath, 'utf8');
  
  const addonVersion = calculateAddonVersion(version);
  
  // Update version string
  const oldVersionMatch = content.match(/version = "([\d.]+)"/);
  const oldVersion = oldVersionMatch ? oldVersionMatch[1] : 'unknown';
  content = content.replace(/version = "[\d.]+"/, `version = "${version}"`);
  
  // Update versionESO number
  const oldESOVersionMatch = content.match(/versionESO = (\d+)/);
  const oldESOVersion = oldESOVersionMatch ? oldESOVersionMatch[1] : 'unknown';
  content = content.replace(/versionESO = \d+/, `versionESO = ${addonVersion}`);
  
  fs.writeFileSync(luaPath, content);
  log.success(`Updated AndyVariables.lua:`);
  log.info(`  version: ${oldVersion} → ${version}`);
  log.info(`  versionESO: ${oldESOVersion} → ${addonVersion}`);
}

/**
 * Update README.md
 */
function updateReadme(version) {
  const readmePath = path.join(__dirname, 'README.md');
  let content = fs.readFileSync(readmePath, 'utf8');
  
  // Update Current Branch Release line
  const oldVersionMatch = content.match(/#### Current Release: \*\*v([\d.]+)\*\*/);
  const oldVersion = oldVersionMatch ? oldVersionMatch[1] : 'unknown';
  content = content.replace(
    /#### Current Release: \*\*v[\d.]+\*\*/,
    `#### Current Release: **v${version}**`
  );
  
  fs.writeFileSync(readmePath, content);
  log.success(`Updated README.md: ${oldVersion} → ${version}`);
}

/**
 * Commit changes to git
 */
function commitChanges(version) {
  try {
    execSync('git add package.json AddonAnalyzer.txt variables.lua README.md', { stdio: 'inherit' });
    execSync(`git commit -m "Bump version to ${version}"`, { stdio: 'inherit' });
    log.success(`Committed version changes: "Bump version to ${version}"`);
  } catch (error) {
    log.error('Failed to commit changes');
    throw error;
  }
}

/**
 * Create git tag
 */
function createTag(version) {
  try {
    const tagName = `v${version}`;
    execSync(`git tag ${tagName}`, { stdio: 'inherit' });
    log.success(`Created git tag: ${tagName}`);
  } catch (error) {
    log.error('Failed to create git tag');
    throw error;
  }
}

/**
 * Push changes and tag to remote
 */
function pushToRemote(version) {
  try {
    const tagName = `v${version}`;
    log.info('Pushing commit to remote...');
    execSync('git push', { stdio: 'inherit' });
    log.success('Pushed commit to remote');
    
    log.info(`Pushing tag ${tagName} to remote...`);
    execSync(`git push origin ${tagName}`, { stdio: 'inherit' });
    log.success(`Pushed tag ${tagName} to remote`);
    
    log.info('');
    log.success('GitHub Actions will now build and create the release!');
    log.info(`View workflow: https://github.com/YOUR_USERNAME/AddonAnalyzer-ESO/actions`);
  } catch (error) {
    log.error('Failed to push to remote');
    throw error;
  }
}

/**
 * Check if script is run through npm and provide helpful warning
 */
function checkNpmUsage() {
  // Check if run through npm (npm_lifecycle_event is set by npm)
  const isRunThroughNpm = process.env.npm_lifecycle_event === 'prep-release';
  
  // If run through npm and only has version argument (no flags)
  if (isRunThroughNpm && process.argv.length === 3) {
    log.warning('Running through npm without flags detected.');
    log.info('');
    log.info('💡 Tip: When using npm run, add "--" before arguments:');
    log.info(`   ${colors.cyan}npm run prep-release -- ${process.argv[2]} --push${colors.reset}`);
    log.info('');
    log.info('Or run the script directly:');
    log.info(`   ${colors.cyan}node prep-release.js ${process.argv[2]} --push${colors.reset}`);
    log.info('');
  }
}

/**
 * Main execution
 */
async function main() {
  const options = parseArgs();

  if (options.help || !options.version) {
    showHelp();
    process.exit(options.help ? 0 : 1);
  }

  log.header('🎭 AddonAnalyzer ESO - Version Management');
  
  // Provide helpful feedback if running through npm incorrectly
  checkNpmUsage();

  // Validate version format
  if (!validateVersion(options.version)) {
    process.exit(1);
  }

  // Check git status if we'll be making commits
  if (options.commit && !isGitClean()) {
    log.warning('Git working directory is not clean');
    log.info('Please commit or stash your changes before proceeding');
    process.exit(1);
  }

  const addonVersion = calculateAddonVersion(options.version);
  log.info(`Preparing release for version ${options.version} (AddOnVersion: ${addonVersion})`);
  console.log('');

  try {
    // Update all version files
    updatePackageJson(options.version);
    updateAndyTxt(options.version);
    updateVariablesLua(options.version);
    updateReadme(options.version);

    console.log('');
    log.success('All version files updated successfully!');

    // Git operations
    if (options.commit) {
      console.log('');
      log.info('Committing changes...');
      commitChanges(options.version);
    }

    if (options.tag) {
      console.log('');
      log.info('Creating git tag...');
      createTag(options.version);
    }

    if (options.push) {
      console.log('');
      log.info('Pushing to remote...');
      pushToRemote(options.version);
    }

    // Final instructions
    console.log('');
    log.header('✨ Next Steps:');
    
    if (!options.commit) {
      log.info('1. Review the changes in the modified files');
      log.info('2. Run with --commit to commit changes');
      log.info('3. Or manually commit: git add . && git commit -m "Bump version to ' + options.version + '"');
    } else if (!options.tag) {
      log.info('1. Review the commit');
      log.info('2. Run with --tag to create and push the release tag');
      log.info('3. Or manually: git tag v' + options.version + ' && git push origin v' + options.version);
    } else if (!options.push) {
      log.info('1. Review the commit and tag');
      log.info('2. Push when ready: git push && git push origin v' + options.version);
      log.info('3. Or re-run with --push to push automatically');
    } else {
      log.success('Release is live! Check GitHub Actions for build status.');
    }

    console.log('');

  } catch (error) {
    console.log('');
    log.error('Version preparation failed!');
    console.error(error);
    process.exit(1);
  }
}

// Run the script
main();
