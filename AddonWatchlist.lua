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
AddonAnalyzer.AddonWatchlistDb = {
    -- Example entries (you can add real ones as they're reported)
    ["Joker"] = {
        reason = "malicious",
        description = "This is a joke addon that is not actually malicious, just here testing.",
        allVersions = true, -- If true, all versions are bad
        reportedDate = "2024-10-15"
    },
    -- ["StolenContentAddon"] = {
    --     reason = "stolen",
    --     description = "Stolen from OriginalAddon by OriginalAuthor",
    --     versions = {"1.0.0", "1.0.1"}, -- Specific bad versions
    --     reportedDate = "2024-09-20"
    -- },
    -- ["CommunityReported"] = {
    --     reason = "community_reported",
    --     description = "Multiple reports of game crashes and performance issues",
    --     allVersions = true,
    --     reportedDate = "2024-08-10"
    -- }
}

-- Reason display names
AddonAnalyzer.ReasonLabels = {
    malicious = "malicious",
    stolen = "stolen content",
    community_reported = "community-reported as problematic"
}
