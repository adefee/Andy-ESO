-- * _ANDY_VERSION: 1.0.0 ** Please do not modify this line.
--[[----------------------------------------------------------
	AddonAnalyzer (Andy)
  ----------------------------------------------------------
  *
	* Authors:
	* - Lent (IGN @CallMeLent, Github @adefee)
  *
  * Contents:
  * - Addon Instantiation
  *
]]--

AddonAnalyzer = AddonAnalyzer or {}
local Andy = AddonAnalyzer
local AndyUtil = AndyUtilityFn or {} -- utility functions used throughout
local ANDY_SAVED_VARS_VERSION = 1

-- debugLog()
-- Helper; Outputs debug message to console if debug mode is enabled
function Andy.debugLog(message)
  if AddonAnalyzer and Andy.saved and Andy.saved.internal and Andy.saved.internal.showDebug and Andy.saved.internal.showDebug > 0 then
    d('AddonAnalyzer: ' .. message)
  end
end

-- Joker.ToggleDebug()
function Andy.ToggleDebug()
  if not Andy.saved or not Andy.saved.internal then
    d('Andy: Error - saved variables not initialized yet.')
    return
  end
  
  if Andy.saved.internal.showDebug > 0 then
    d('Disabling Andy debug mode.')
    Andy.saved.internal.showDebug = 0
  else
    d('Enabling Andy debug mode.')
    Andy.saved.internal.showDebug = 1
  end
end

-- Runs only the first time load
-- Specifically snake_case because it's a runtime function
function Andy.FirstRun()
  Andy.debugLog('Running Andy.FirstRun()')
  d('AddonAnalyzer ' .. Andy.version .. ' is now active! Type /andy or /addonanalyzer at any time to view available options.')
  Andy.saved.internal.firstLoad = 0
end


--[[----------------------------------------------------------
  Version Migration Functions
  When major changes to savedVars occur, we'll run these based on lastUpdate timestamp
  ----------------------------------------------------------
]]--
-- migrate_to_1_0_0()
-- Migration; Update 1.0.0 adds ... first build
function Andy.migrate_to_1_0_0()
  Andy.debugLog('Housekeeping for update to version 1.0.0')
  Andy.saved.internal.lastUpdate = 100000 -- Version should be an esoVersion style
end

-- Run any updates needed if addon has been updated
function Andy.RuntimeUpdates()
  Andy.debugLog('Running RuntimeUpdates()')
  Andy.debugLog('Andy.saved.internal.lastUpdate: ' .. Andy.saved.internal.lastUpdate)
  if Andy.saved.internal.lastUpdate < Andy.versionESO then
    local oldAndyVersion = Andy.saved.internal.lastUpdate
    Andy.debugLog('oldAndyVersion: ' .. oldAndyVersion)
    -- Run migrations in order
    if oldAndyVersion < 100000 then
      Andy.migrate_to_1_0_0()
    end
  end
end


-- Intended to run each time `EVENT_ADD_ON_LOADED` fires
function Andy.RuntimeOnLoad()
  Andy.debugLog('Running RuntimeOnLoad()')

  Andy.RuntimeUpdates()

  --[[
    Periodic Events
    > Auto scans
  ]]
  AndyUtil.runPeriodicEvents('scan', {
    joke = function() Andy.getInstalledAddons() end
  })

  --[[
    Add our Slash commands
  ]]
  SLASH_COMMANDS["/_andy-debug"] = function () Andy.ToggleDebug() end
end

-- Intended to run each time `EVENT_PLAYER_ACTIVATED` fires
function Andy.RuntimeOnActivated()
  Andy.debugLog('Running AndyRuntimeOnActivated()')

  Andy.debugLog('Debug mode enabled. Run /_andy-debug to toggle off.')
  Andy.debugLog('Version ' .. Andy.version .. ' is now active!') -- Log current version

  if IsConsoleUI() then
    Andy.debugLog('Console UI detected.')
  else
    Andy.debugLog('PC UI detected.')
  end
end

--[[
  *****************************
  ** Addon Instantiation, Hook to Ingame Events
  *****************************

  - `EVENT_ADD_ON_LOADED` fires when the game has finished loading (or attempting to load) all of an add-on's files. This event will fire once for EACH of the enabled addons, which is why we unregister it after we've done our thing.
  - `EVENT_PLAYER_ACTIVATED` fires after the player has loaded (each time the player logs in or UI is reloaded). This runs after `EVENT_ADD_ON_LOADED`.
]]

function Andy.Activated(e)
  Andy.debugLog('Running Andy.Activated()')

  EVENT_MANAGER:UnregisterForEvent(Andy.name, EVENT_PLAYER_ACTIVATED)

  if Andy.saved then
    Andy.debugLog('Andy.saved is available')
    if Andy.saved.internal.firstLoad > 0 then
      Andy.FirstRun()
    end

    -- Run through any necessary updates
    Andy.RuntimeUpdates()

    -- Run any necessary functions that should run each EVENT_PLAYER_ACTIVATED event.
    Andy.RuntimeOnActivated()
  end
end

-- Attach to event: When player is ready, only after everything is loaded.
EVENT_MANAGER:RegisterForEvent(Andy.name, EVENT_PLAYER_ACTIVATED, Andy.Activated) 


function Andy.OnAddonLoaded(event, addonName)
  Andy.debugLog('Running Andy.OnAddonLoaded()')
  if addonName ~= Andy.name then return end

  EVENT_MANAGER:UnregisterForEvent(Andy.name, EVENT_ADD_ON_LOADED)

  -- Load Saved Variables
  Andy.saved = ZO_SavedVars:NewAccountWide('AndySavedVars', ANDY_SAVED_VARS_VERSION, nil, Andy.defaults)

  -- Init primary runtime (each load)
  Andy.RuntimeOnLoad()
end

EVENT_MANAGER:RegisterForEvent(Andy.name, EVENT_ADD_ON_LOADED, Andy.OnAddonLoaded) -- Press Start.


-- Check if a specific addon is in the bad addons database
function Andy.CheckAddon(name, version)
    local normalizedName = NormalizeAddonName(name)
    
    for badAddonName, info in pairs(Andy.BadAddonsDB) do
        local normalizedBadName = NormalizeAddonName(badAddonName)
        
        if normalizedName == normalizedBadName then
            -- Check if all versions are bad or if this specific version is bad
            if info.allVersions then
                return true, info
            elseif info.versions and version then
                for _, badVersion in ipairs(info.versions) do
                    if version == badVersion then
                        return true, info
                    end
                end
            end
        end
    end
    
    return false, nil
end
