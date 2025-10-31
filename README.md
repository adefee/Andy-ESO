# Addon Analyzer

An Elder Scrolls Online addon that helps protect the community by identifying malicious, stolen, or problematic addons.

## Features

- **Manual Scanning**: Run `/andy` or `/andy scan` to scan all installed addons
- **Automatic Monitoring**: Automatically checks for new or updated addons on every game load
- **Community Protection**: Warns users about addons that have been reported as malicious, stolen content, or problematic
- **Version Tracking**: Tracks addon versions to detect updates and re-check them

## Commands

- `/andy` or `/andy scan` - Manually scan for flagged addons
- `/andy suppress` - Suppress current warnings until a new flagged addon is found or Andy is updated
- `/andy monitor` - Re-enable warnings (undo suppress)
- `/andy sound` - Toggle warning sound on/off
- `/andy announce` - Toggle center screen banner on/off
- `/andy quiet` - Toggle quiet mode (only show messages when flagged addons are found)
- `/andy debug` - Enable debug mode (additional logging)

## How It Works

1. **On Load**: Each time you start the game, Addon Analyzer automatically checks for any new addons or updated versions
2. **Alerts**: If a problematic addon is detected, you'll see a warning in your chat with details about why it's flagged
3. **Manual Scans**: You can run a full scan anytime using the slash commands

## Database Management

The addon maintains two databases in `AndyWatchlist.lua`:

### Flagged Addons
```lua
Andy.AddonWatchlistDb["AddonName"] = {
    reason = "malicious",  -- Options: "malicious", "stolen", "community_reported"
    description = "Detailed description of the issue",
    allVersions = true,    -- Set to true if all versions are problematic
    -- OR
    versions = {"1.0.0", "1.0.1"},  -- List specific problematic versions
    platform = "pc",       -- Options: "pc", "console", "both" (or nil defaults to "both")
    reportedDate = "2025-10-27"
}
```

### Flagged Authors
```lua
Andy.AuthorWatchlistDb["AuthorName"] = {
    reason = "malicious",  -- Options: "malicious", "stolen", "community_reported"
    description = "Description of why this author is flagged",
    platform = "console",  -- Options: "pc", "console", "both" (or nil defaults to "both")
    reportedDate = "2025-10-27"
}
```

## Website

Visit our [GitHub Pages site](https://adefee.github.io/Andy/) to:
- Learn more about the addon
- Browse the current database of flagged addons and authors
- Report problematic addons

The website automatically updates whenever changes are pushed to `AndyWatchlist.lua` on the main branch, thanks to a GitHub Actions workflow that syncs the data.

## Installation

1. Download or clone this repository
2. Place the `AddonAnalyzer` folder in your ESO addons directory:
   - **PC**: `Documents/Elder Scrolls Online/live/AddOns/`
   - **PTS**: `Documents/Elder Scrolls Online/pts/AddOns/`
3. Launch the game and the addon will automatically load

## Contributing

If you know of an addon that should be added to the database, please submit an issue or pull request with:
- Addon name or author name
- Version(s) affected (for addons)
- Reason (malicious/stolen/community_reported)
- Description of the issue
- Platform (pc/console/both)
- Evidence or source of the report

### For Maintainers

When updating `AndyWatchlist.lua`:
1. Add entries directly to the file
2. Test locally with `npm run update-docs` to preview the website changes
3. Push to main - the GitHub Pages site will automatically update

## Version

Current Version: 1.0.0

## API Version

Compatible with ESO API versions 101043 and 101044 (and likely newer versions).
