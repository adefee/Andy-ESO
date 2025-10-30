-- * _ANDY_VERSION: 1.0.0 ** Please do not modify this line.
--[[----------------------------------------------------------
	AddonAnalyzer (ANDY)
  ----------------------------------------------------------
  *
	* Authors:
	* - Lent (IGN @CallMeLent, Github @adefee)
  *
  * Contents (core scan functions used by Andy):
  * - isEmpty()
  *
]]--

AddonAnalyzer = AddonAnalyzer or {}
local Andy = AddonAnalyzer

-- getInstalledAddons()
-- Get a list of installed addons
function Andy.getInstalledAddons()
  
  d('getInstalledAddons() placeholder...')

  return {}
end

-- scanSingleAddon()
-- Given a single addon, see if it's in our AddonWatchlistDb
function Andy.scanSingleAddon(addonData)
  
  d('scanSingleAddon() placeholder...')

  -- Return a scan result
  return false
end

-- quickScanAllAddons()
-- Called on UI load, gets list of addons and scans each against AddonWatchlistDb
function Andy.quickScanAllAddons(addonData)
  
  d('quickScanAllAddons() placeholder...')

  -- Return results
  return {}
end

AddonAnalyzer = Andy or {}
