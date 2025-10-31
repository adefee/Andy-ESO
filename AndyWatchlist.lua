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

Andy = Andy or {}

-- Database of bad addons
-- Key: Addon name (case-insensitive matching will be used)
-- Value: Table with reason and optional version info
-- Platform field: "pc", "console", "both", or nil (nil defaults to "both")
Andy.AddonWatchlistDb = {
    -- Example entries (you can add real ones as they're reported)
    ["LibText"] = {
        reason = "malicious",
        description = "This addon has a denylist that silently blocks some players' messages, market postings, etc.",
        allVersions = true, -- If true, all versions are bad
        platform = "console",
        reportedDate = "2025-10-27"
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
Andy.AuthorWatchlistDb = {
    -- Example entries (you can add real ones as they're reported)
    ["TheStylishIrish"] = {
        reason = "malicious",
        description = "Responsible for several malicious addons, now removed by Bethesda.",
        platform = "console",
        reportedDate = "2025-10-27"
    }
    -- ["StolenContentThief"] = {
    --     reason = "stolen",
    --     description = "Steals and republishes other developers' work",
    --     platform = "pc",
    --     reportedDate = "2024-09-15"
    -- }
}

-- Reason display names
Andy.ReasonLabels = {
    malicious = "malicious",
    stolen = "stolen content",
    community_reported = "community-reported as problematic"
}
