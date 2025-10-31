-- * _ANDY_VERSION: 1.0.0 ** Please do not modify this line.
--[[----------------------------------------------------------
	AddonAnalyzer (ANDY)
  ----------------------------------------------------------
  *
	* Authors:
	* - Lent (IGN @CallMeLent, Github @adefee)
  *
  * Contents:
  * - Addon Watchlist (the addons we look for and flag, and their reasons)
  *
  * Modify this yourself if there are specific addons you want to watch for, or
  * you can submit your changes on Github.
  *
]]--

AddonAnalyzer = AddonAnalyzer or {}

-- Database of bad addons
-- Key: Addon name (case-insensitive matching will be used)
-- Value: Table with reason and optional version info
-- Platform field: "pc", "console", "both", or nil (nil defaults to "both")
AddonAnalyzer.AddonWatchlistDb = {
    -- Example entries (you can add real ones as they're reported)
    ["jokerrr"] = {
        reason = "malicious",
        description = "This is a joke addon that is not actually malicious, just here testing.",
        allVersions = true, -- If true, all versions are bad
        platform = "pc", -- Available on both platforms
        reportedDate = "2024-10-15"
    },
    -- ["StolenContentAddon"] = {
    --     reason = "stolen",
    --     description = "Stolen from OriginalAddon by OriginalAuthor",
    --     versions = {"1.0.0", "1.0.1"}, -- Specific bad versions
    --     platform = "pc", -- Only on PC
    --     reportedDate = "2024-09-20"
    -- },
    -- ["ConsoleOnlyBadAddon"] = {
    --     reason = "malicious",
    --     description = "Console-specific malicious addon",
    --     allVersions = true,
    --     platform = "console", -- Only on Console
    --     reportedDate = "2024-08-10"
    -- },
    -- ["CommunityReported"] = {
    --     reason = "community_reported",
    --     description = "Multiple reports of game crashes and performance issues",
    --     allVersions = true,
    --     -- platform not specified defaults to "both"
    --     reportedDate = "2024-08-10"
    -- }
}

-- Database of flagged authors
-- Key: Author name (case-insensitive substring matching will be used)
--      The author name will match if it appears anywhere in the addon's author field
--      Examples: "Foo" will match "@Foo", "by Foo", "[Foo]", "Foo and Bar", etc.
-- Value: Table with reason and description
-- Platform field: "pc", "console", "both", or nil (nil defaults to "both")
AddonAnalyzer.AuthorWatchlistDb = {
    -- Example entries (you can add real ones as they're reported)
    ["CallMeLent"] = {
        reason = "malicious",
        description = "Not actually malicious",
        platform = "both",
        reportedDate = "2024-10-20"
    }
    -- ["StolenContentThief"] = {
    --     reason = "stolen",
    --     description = "Steals and republishes other developers' work",
    --     platform = "pc",
    --     reportedDate = "2024-09-15"
    -- }
}

-- Reason display names
AddonAnalyzer.ReasonLabels = {
    malicious = "malicious",
    stolen = "stolen content",
    community_reported = "community-reported as problematic"
}
