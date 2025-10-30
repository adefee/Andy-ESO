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
local AndyUtil = AndyUtilityFn or {}

-- getInstalledAddons()
-- Get a list of installed addons
function Andy.getInstalledAddons()
  local addons = {}
  local AddOnManager = GetAddOnManager()
  local numAddons = AddOnManager:GetNumAddOns()
  
  Andy.debugLog('Scanning ' .. numAddons .. ' installed addons...')
  
  for i = 1, numAddons do
    local name, title, author, description, enabled, state, isOutOfDate = AddOnManager:GetAddOnInfo(i)
    
    if name and enabled then
      -- Get version from manifest
      local version = AddOnManager:GetAddOnVersion(i)
      
      table.insert(addons, {
        name = name,
        title = title,
        author = author,
        version = version,
        enabled = enabled,
        isOutOfDate = isOutOfDate
      })
    end
  end
  
  Andy.debugLog('Found ' .. #addons .. ' enabled addons')
  return addons
end

-- scanSingleAddon()
-- Given a single addon, see if it's in our AddonWatchlistDb
function Andy.scanSingleAddon(addonData)
  if not addonData or not addonData.name then
    return nil
  end
  
  -- Normalize the addon name for case-insensitive comparison
  local normalizedName = AndyUtil.normalizeAddonName(addonData.name)
  
  -- Check against watchlist
  for watchlistAddonName, watchlistInfo in pairs(Andy.AddonWatchlistDb) do
    local normalizedWatchlistName = AndyUtil.normalizeAddonName(watchlistAddonName)
    
    if normalizedName == normalizedWatchlistName then
      -- Found a match! Now check version
      if watchlistInfo.allVersions then
        -- All versions are flagged
        return {
          found = true,
          addonName = addonData.name,
          version = addonData.version,
          reason = watchlistInfo.reason,
          description = watchlistInfo.description,
          reportedDate = watchlistInfo.reportedDate
        }
      elseif watchlistInfo.versions and addonData.version then
        -- Check if this specific version is flagged
        for _, badVersion in ipairs(watchlistInfo.versions) do
          if addonData.version == badVersion then
            return {
              found = true,
              addonName = addonData.name,
              version = addonData.version,
              reason = watchlistInfo.reason,
              description = watchlistInfo.description,
              reportedDate = watchlistInfo.reportedDate
            }
          end
        end
      end
    end
  end
  
  -- No match found
  return nil
end

-- quickScanAllAddons()
-- Called on UI load, gets list of addons and scans each against AddonWatchlistDb
function Andy.quickScanAllAddons()
  Andy.debugLog('Running quickScanAllAddons()')
  
  -- Get all installed addons
  local installedAddons = Andy.getInstalledAddons()
  local flaggedAddons = {}
  
  -- Scan each addon
  for _, addon in ipairs(installedAddons) do
    local scanResult = Andy.scanSingleAddon(addon)
    if scanResult then
      table.insert(flaggedAddons, scanResult)
    end
  end
  
  -- Log results to chat
  if #flaggedAddons > 0 then
    d('|cFF0000[AddonAnalyzer WARNING]|r Found ' .. #flaggedAddons .. ' flagged addon(s):')
    
    for _, result in ipairs(flaggedAddons) do
      local reasonLabel = Andy.ReasonLabels[result.reason] or result.reason
      local versionText = result.version and (' v' .. result.version) or ''
      
      d('  |cFF8800' .. result.addonName .. versionText .. '|r - Flagged as: ' .. reasonLabel)
      
      if result.description then
        d('    ' .. result.description)
      end
    end
    
    d('|cFFFF00Please review these addons and consider removing them.|r')
  else
    Andy.debugLog('No flagged addons found - all clear!')
  end
  
  return flaggedAddons
end

AddonAnalyzer = Andy or {}
