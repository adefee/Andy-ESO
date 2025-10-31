# Andy - ESO Addon Analyzer

An Elder Scrolls Online addon that helps protect the community by identifying malicious, stolen, paywalled, or otherwise ToS/EULA-violating addons. This was initially created in response to the discovery of the [LibText console addon](https://www.esoui.com/downloads/info2363-LibText.html) by TheStylishIrish, which was removed by Bethesda after being discovered by community addon authors as being malicious. 

#### Current Release: **v1.0.1** (ESO-101048)

## Features

- **Manual Scanning**: Run `/andy scan` to scan all installed addons on-demand. It will check against a known watchlist of flagged addons and authors.
- **Automatic Monitoring**: Automatically checks for new or updated addons 
- **Community Protection**: Warns users about addons that have been reported as malicious, stolen (e.g. plagiarized), paywalled, or otherwise ToS/EULA-violating (like circumvention of game protections)
- **Suppression Support**: Run `/andy suppress` to suppress warnings until next update or add'l flagged addons are found
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

1. **On Load**: Andy automatically checks for any new addons or updated versions that match both addon and author watchlists (and accounts for platform, e.g. console vs PC)
2. **Alerts**: If a problematic addon is detected, you'll see a warning in your chat with details about why it's flagged. By default, you'll also see a center screen banner and a warning sound will play (these can be toggled off individually with the `/andy sound` and `/andy announce` commands)
3. **Manual Scans**: You can run a full scan anytime using the slash commands

## Watchlist Management

The addon maintains two lists in `AndyWatchlist.lua`:

### Flagged Addons
```lua
Andy.AddonWatchlistDb["AddonName"] = {
    reason = "malicious",  -- Options: "malicious", "stolen", "paywall", "tos_eula"
    description = "Detailed description of the issue",
    author = "AuthorName", -- Optional: author name for display
    allVersions = true,    -- Set to true if all versions are problematic
    -- OR
    versions = {"1.0.0", "1.0.1"},  -- List specific problematic versions, if allVersions is false
    platform = "pc",       -- Options: "pc", "console", "both" (or nil defaults to "both")
    reportedDate = "2025-10-27"
}
```

### Flagged Authors
```lua
Andy.AuthorWatchlistDb["AuthorName"] = {
    reason = "malicious",  -- Options: "malicious", "stolen", "paywall", "tos_eula"
    description = "Description of why this author is flagged",
    platform = "console",  -- Options: "pc", "console", "both" (or nil defaults to "both")
    reportedDate = "2025-10-27"
}
```

**Reason Categories:**
- **malicious** - Addons/authors with harmful intent
- **stolen** - Stolen or plagiarized content
- **paywall** - Locks features behind payment in violation of addon guidelines
- **tos_eula** - Violates Terms of Service or EULA (e.g., circumvents game protections)

## Website

Visit our [GitHub Pages site](https://adefee.github.io/Andy-ESO/) to:
- Learn more about the addon
- Browse the current watchlist of flagged addons and authors
- Report problematic addons

The website automatically updates whenever changes are pushed to `AndyWatchlist.lua` on the main branch, thanks to a GitHub Actions workflow that syncs the data - so the data you see on the website is the same as used ingame in the latest release.

## Installation

1. Download directly from the [releases page](https://github.com/adefee/Andy-ESO/releases) or clone this repository. If you download from the releases page, you'll need to extract the release zip.
2. Place the `Andy` folder in your ESO addons directory:
   - **PC**: `Documents/Elder Scrolls Online/live/AddOns/`
   - **PTS**: `Documents/Elder Scrolls Online/pts/AddOns/`
3. Launch the game and the addon will automatically load and begin monitoring for flagged addons and authors. You'll see an initial 'first run' message in chat, and you can see available commands with `/andy`.

## Contributing

If you know of an addon that should be added to the watchlist, please submit an issue or pull request with:
- Addon name or author name
- Author of addon (optional, for addon entries)
- Version(s) affected (for addons)
- Reason (malicious/stolen/paywall/tos_eula)
- Description of the issue
- Platform (pc/console/both)
- Evidence or source of the report

Note that submissions without sufficient evidence will be rejected, and multiple faulty reports will result in blocks from further submissions (don't cry wolf).

### For Maintainers

When updating `AndyWatchlist.lua`:
1. Add entries directly to the file
2. Test locally with `npm run update-docs` to preview the website changes
3. PR to main - the GitHub Pages site will automatically update once the PR is merged

## Version

Current Version: 1.0.0

## API Version

Compatible with ESO API versions 101043 and 101044 (and likely newer versions).
