-- * _ANDY_VERSION: 1.0.0 ** Please do not modify this line.
--[[----------------------------------------------------------
	AddonAnalyzer (ANDY)
  ----------------------------------------------------------
  *
	* Authors:
	* - Lent (IGN @CallMeLent, Github @adefee)
  *
  * Contents:
  * - Base/Default ANDY vars
  *
]]--
AddonAnalyzer = {
  name = "AddonAnalyzer",
  version = "1.0.0",
  versionESO = 100000,
  author = "Lent (IGN @CallMeLent, Github @adefee)",
  color = "D66E4A",
  attribution = {
    author = "Lent",
    authorIGN = "@CallMeLent",
    authorDiscord = "Lent",
    authorGit = "@adefee"
  },
  utility = {},
  data = {},
  saved = {},
  defaults = {
    count = {
      loaded = 0,
      affected = 0,
    },
    enable = {
      autoScan = 1, -- Automatically scan on UI reload
    },
    internal = {
      lastUpdate = 0,
      firstLoad = 1,
      showDebug = 1
    },
    seenWatchlistAddons = { -- ANDY History: User's installed addons that have been flagged in the past
    }
  }
}
