# Build & Release Guide

This guide explains how to build and release the Joker ESO addon using the latest (>= 8.5.X) build system. NodeJS > v20 is required (latest LTS is recommended: 24.X at time of writing). I used Node rather than sh for cross-OS compatibility: specifcally, some native OS archiving tools generate archives that Minion or other addon managers don't unpack properly (deflate compat, for example).

## Quick Start

### Local Development Build

```bash
# Install dependencies (first time only)
npm install

# Build the addon
npm run build
```

The build output will be at: `dist/<version>/joker-<version>.zip`

### Creating a Release

The release process is now automated with the `prep-release` script!

#### Option 1: Automated Release (Recommended)

```bash
# Update version, commit, tag, and push in one command
npm run prep-release -- 8.5.0 --push
```

**Important:** The `--` is required when using `npm run` to pass arguments to the script!

This will:
1. Update version in all required files (package.json, Joker.txt, variables.lua, README.md)
2. Commit the changes with message "Bump version to 8.5.0"
3. Create git tag `v8.5.0`
4. Push commit and tag to remote
5. Trigger GitHub Actions to build and release

#### Option 2: Step-by-Step Release

```bash
## Choose one of the options below:

# Step 1: Update version files only (review changes first)
npm run prep-release -- 8.5.0

# Step 2: Commit the changes
npm run prep-release -- 8.5.0 --commit

# Step 3: Create and push tag (triggers release)
npm run prep-release -- 8.5.0 --push
```

Or run directly without the `--`:

```bash
node prep-release.js 8.5.0 --push
```

#### Option 3: Manual Release (Old Way)

If you prefer manual control:

1. **Update the version** in all required files:
   - `package.json` - Main version number
   - `Joker.txt` - Both `Version:` and `AddOnVersion:` fields
   - `variables.lua` - `version` and `versionESO` constants
   - `README.md` - Current branch release badge

2. **Commit your changes:**
   ```bash
   git add .
   git commit -m "Bump version to X.Y.Z"
   git push origin <branch>
   ```

3. **Create and push a tag:**
   ```bash
   git tag vX.Y.Z
   git push origin vX.Y.Z
   ```

#### GitHub Actions

Once a tag is pushed, GitHub Actions will automatically:
- Build the addon on Ubuntu runners
- Create a GitHub release
- Attach the zip file as a release asset
- Generate release notes with installation instructions

#### prep-release Script Options

```bash
npm run prep-release -- <version> [options]
# or
node prep-release.js <version> [options]

Options:
  -h, --help      Show help message
  -c, --commit    Commit the version changes
  -t, --tag       Create git tag (implies --commit)
  -p, --push      Push commit and tag (implies --tag and --commit)

Examples:
  npm run prep-release -- 8.5.0           # Update files only
  npm run prep-release -- 8.5.0 --commit  # Update and commit
  npm run prep-release -- 8.5.0 --tag     # Update, commit, and tag
  npm run prep-release -- 8.5.0 --push    # Complete release (recommended)
  
  # Or run directly (no '--' needed)
  node prep-release.js 8.5.0 --push
```

## Build System Details

### Local Build Process

The build script (`build.js`) uses the `archiver` Node.js library to create standard-compliant zip files:

- **Compression:** Deflate level 9 (maximum compatibility)
- **Structure:** All files are placed in a `Joker/` folder inside the zip
- **Platform:** Works on Windows, macOS, and Linux
- **Compatibility:** Fully compatible with Minion and other ESO addon managers

### What's Included in the Build

The build creates a slim, runtime-only package containing **only** what ESO needs to run the addon:

**✅ Included:**
- `*.lua` files - All Lua code (Joker.lua, variables.lua, etc.)
- `*.xml` files - UI definitions (Joker.xml, bindings.xml)
- `Joker.txt` - Addon manifest (required by ESO)
- `i18n/` - Translation files for all supported languages
- `jokes/` - All joke content files
- `options/` - Settings/customization code

**❌ Excluded (not needed for runtime):**
- `README.md` - Documentation (not needed in-game)
- `LICENSE` - License file (not needed in-game)
- `package.json` / `package-lock.json` - Node.js package management
- `build.js` / `prep-release.js` - Build scripts
- `.github/` - GitHub Actions workflows and documentation
- `images/` - Screenshots and logos (not used in-game)
- `.git/` - Git repository data
- `.vscode/` - Editor settings
- `node_modules/` - Node.js dependencies
- `dist/` - Build output folder
- `sample_saved_variables_pre_804000.lua` - Example/legacy file
- Dev/build artifacts

**Result:** A clean, minimal zip file optimized for ESO addon managers like Minion.

### GitHub Actions Workflow

The workflow (`.github/workflows/release.yml`) consists of two jobs:

#### 1. Build Job
- Runs on: `ubuntu-latest`
- Checks out code
- Sets up Node.js 20
- Installs dependencies
- Runs the build script
- Uploads the artifact to GitHub

#### 2. Release Job
- Runs on: `ubuntu-latest`
- Only runs when triggered by a tag push or manual dispatch
- Downloads the build artifact
- Extracts version info from `package.json` and `Joker.txt`
- Creates a GitHub release with auto-generated notes
- Attaches the zip file to the release

### Manual Release Trigger

You can manually trigger a release from the GitHub Actions tab:

1. Go to: `Actions` → `Build and Release`
2. Click `Run workflow`
3. Select the branch
4. Choose whether to create a release
5. Click `Run workflow`

## Troubleshooting

### Local Build Issues

**Error: Cannot find module 'archiver'**
```bash
npm install
```

**Build fails with permission errors**
```bash
# On Unix systems, ensure you have write permissions
chmod -R u+w dist/
```

### GitHub Actions Issues

**Workflow doesn't trigger on tag push**
- Ensure you're pushing the tag with `git push origin vX.Y.Z`
- Check that the tag starts with `v` (e.g., `v8.4.0`)

**Release creation fails**
- Verify that GitHub Actions has write permissions in your repo settings
- Check the Actions tab for detailed error logs

**Artifact not found**
- Ensure the build job completed successfully before the release job runs
- Check that the version in `package.json` matches the expected artifact name

## Version Numbering

The project uses semantic versioning: `MAJOR.MINOR.PATCH`

- **MAJOR:** Breaking changes or major new features
- **MINOR:** New features, backward compatible
- **PATCH:** Bug fixes and minor improvements

The `AddOnVersion` in `Joker.txt` should be the version number with two zeros appended:
- Version `8.4.0` → `AddOnVersion: 804000`
- Version `8.4.1` → `AddOnVersion: 804100`

## Best Practices

1. **Always test locally** before pushing a tag
2. **Update all version files** before creating a release
3. **Use meaningful commit messages** - they may appear in release notes
4. **Review the build output** in GitHub Actions before announcing
5. **Keep the CHANGELOG** up to date (if you add one)

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Archiver Documentation](https://www.archiverjs.com/)
- [ESO Addon Development](https://wiki.esoui.com/AddOn_development)
- [Minion Addon Manager](https://minion.mmoui.com/)
