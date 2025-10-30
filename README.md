# Addon Analyzer

An Elder Scrolls Online addon that helps protect the community by identifying malicious, stolen, or problematic addons.

## Features

- **Manual Scanning**: Run `/andy` or `/analyze-addons` to scan all installed addons
- **Automatic Monitoring**: Automatically checks for new or updated addons on every game load
- **Community Protection**: Warns users about addons that have been reported as malicious, stolen content, or problematic
- **Version Tracking**: Tracks addon versions to detect updates and re-check them

## Commands

- `/andy` - Run a full analysis of your installed addons
- `/analyze-addons` - Alternative command for the same analysis

## How It Works

1. **On Load**: Each time you start the game, Addon Analyzer automatically checks for any new addons or updated versions
2. **Alerts**: If a problematic addon is detected, you'll see a warning in your chat with details about why it's flagged
3. **Manual Scans**: You can run a full scan anytime using the slash commands

## Database Management

The addon maintains a database of known bad addons in `BadAddons.lua`. To add an entry:

```lua
["AddonName"] = {
    reason = "malicious",  -- Options: "malicious", "stolen", "community_reported"
    description = "Detailed description of the issue",
    allVersions = true,    -- Set to true if all versions are problematic
    -- OR
    versions = {"1.0.0", "1.0.1"},  -- List specific problematic versions
    reportedDate = "2024-10-28"
}
```

## Installation

1. Download or clone this repository
2. Place the `AddonAnalyzer` folder in your ESO addons directory:
   - **PC**: `Documents/Elder Scrolls Online/live/AddOns/`
   - **PTS**: `Documents/Elder Scrolls Online/pts/AddOns/`
3. Launch the game and the addon will automatically load

## Contributing

If you know of an addon that should be added to the database, please submit an issue or pull request with:
- Addon name
- Version(s) affected
- Reason (malicious/stolen/community_reported)
- Description of the issue
- Evidence or source of the report

## Version

Current Version: 1.0.0

## API Version

Compatible with ESO API versions 101043 and 101044 (and likely newer versions).
