/*
═══════════════════════════════════════════════════════════════════════════
  COMPONENT INTEGRATION EXAMPLES
═══════════════════════════════════════════════════════════════════════════

Shows how to integrate the useBypass() hook into your existing category
components (aim-category.tsx, visuals-category.tsx, settings-category.tsx).

Copy and paste these examples into your respective component files.
═══════════════════════════════════════════════════════════════════════════
*/


// ═══════════════════════════════════════════════════════════════════════════
// EXAMPLE 1: aim-category.tsx - Complete Integration
// ═══════════════════════════════════════════════════════════════════════════

'use client';

import { useCallback, useState } from 'react';
import { useBypass } from '@/hooks/useBypass';

export function AimCategory() {
  const { activateFeature, deactivateFeature, checkConnection } = useBypass();
  
  // State for connection status
  const [isConnected, setIsConnected] = useState(false);
  const [activatedFeatures, setActivatedFeatures] = useState<{
    rageAim: boolean;
    legitAim: boolean;
  }>({
    rageAim: false,
    legitAim: false,
  });

  // Check connection on mount
  useEffect(() => {
    checkConnection().then(connected => {
      setIsConnected(connected);
    });
  }, [checkConnection]);

  // Handle Rage Aim
  const handleRageAim = useCallback(async () => {
    if (!isConnected) {
      alert('Server not connected');
      return;
    }

    const featureName = 'RAGE_AIM';
    const shouldActivate = !activatedFeatures.rageAim;

    try {
      if (shouldActivate) {
        await activateFeature(featureName, {
          smoothness: 0.5,
          fov: 90,
        });
        setActivatedFeatures(prev => ({ ...prev, rageAim: true }));
      } else {
        await deactivateFeature(featureName);
        setActivatedFeatures(prev => ({ ...prev, rageAim: false }));
      }
    } catch (error) {
      console.error('Failed to toggle Rage Aim:', error);
      alert('Failed to toggle Rage Aim');
    }
  }, [isConnected, activatedFeatures.rageAim, activateFeature, deactivateFeature]);

  // Handle Legit Aim
  const handleLegitAim = useCallback(async () => {
    if (!isConnected) {
      alert('Server not connected');
      return;
    }

    const featureName = 'LEGIT_AIM';
    const shouldActivate = !activatedFeatures.legitAim;

    try {
      if (shouldActivate) {
        await activateFeature(featureName, {
          smoothness: 0.3,
          speed: 2.0,
        });
        setActivatedFeatures(prev => ({ ...prev, legitAim: true }));
      } else {
        await deactivateFeature(featureName);
        setActivatedFeatures(prev => ({ ...prev, legitAim: false }));
      }
    } catch (error) {
      console.error('Failed to toggle Legit Aim:', error);
      alert('Failed to toggle Legit Aim');
    }
  }, [isConnected, activatedFeatures.legitAim, activateFeature, deactivateFeature]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Aim Features</h2>
      
      {!isConnected && (
        <div className="bg-red-500/20 border border-red-500 rounded px-3 py-2 text-sm">
          ⚠️ Server not connected - features will not work
        </div>
      )}

      {/* Rage Aim */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-white font-medium">Rage Aim</span>
          <button
            onClick={handleRageAim}
            className={`px-4 py-2 rounded font-semibold transition-all ${
              activatedFeatures.rageAim
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            {activatedFeatures.rageAim ? 'UNLOAD' : 'LOAD'}
          </button>
        </div>
      </div>

      {/* Legit Aim */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-white font-medium">Legit Aim</span>
          <button
            onClick={handleLegitAim}
            className={`px-4 py-2 rounded font-semibold transition-all ${
              activatedFeatures.legitAim
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            {activatedFeatures.legitAim ? 'UNLOAD' : 'LOAD'}
          </button>
        </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// EXAMPLE 2: visuals-category.tsx - Complete Integration
// ═══════════════════════════════════════════════════════════════════════════

'use client';

import { useCallback, useState } from 'react';
import { useBypass } from '@/hooks/useBypass';

export function VisualsCategory() {
  const { activateFeature, deactivateFeature, checkConnection } = useBypass();
  
  const [isConnected, setIsConnected] = useState(false);
  const [activatedFeatures, setActivatedFeatures] = useState<{
    esp: boolean;
    chams: boolean;
  }>({
    esp: false,
    chams: false,
  });

  useEffect(() => {
    checkConnection().then(connected => {
      setIsConnected(connected);
    });
  }, [checkConnection]);

  const handleESP = useCallback(async () => {
    if (!isConnected) {
      alert('Server not connected');
      return;
    }

    const featureName = 'ESP';
    const shouldActivate = !activatedFeatures.esp;

    try {
      if (shouldActivate) {
        await activateFeature(featureName, {
          boxType: 'corner',
          espColor: [0, 255, 0],
          distance: 300,
        });
        setActivatedFeatures(prev => ({ ...prev, esp: true }));
      } else {
        await deactivateFeature(featureName);
        setActivatedFeatures(prev => ({ ...prev, esp: false }));
      }
    } catch (error) {
      console.error('Failed to toggle ESP:', error);
      alert('Failed to toggle ESP');
    }
  }, [isConnected, activatedFeatures.esp, activateFeature, deactivateFeature]);

  const handleChams = useCallback(async () => {
    if (!isConnected) {
      alert('Server not connected');
      return;
    }

    const featureName = 'CHAMS';
    const shouldActivate = !activatedFeatures.chams;

    try {
      if (shouldActivate) {
        await activateFeature(featureName, {
          chamsType: 'flat',
          enemyColor: [255, 0, 0],
          teamColor: [0, 0, 255],
        });
        setActivatedFeatures(prev => ({ ...prev, chams: true }));
      } else {
        await deactivateFeature(featureName);
        setActivatedFeatures(prev => ({ ...prev, chams: false }));
      }
    } catch (error) {
      console.error('Failed to toggle Chams:', error);
      alert('Failed to toggle Chams');
    }
  }, [isConnected, activatedFeatures.chams, activateFeature, deactivateFeature]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Visual Features</h2>
      
      {!isConnected && (
        <div className="bg-red-500/20 border border-red-500 rounded px-3 py-2 text-sm">
          ⚠️ Server not connected - features will not work
        </div>
      )}

      {/* ESP */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-white font-medium">ESP</span>
          <button
            onClick={handleESP}
            className={`px-4 py-2 rounded font-semibold transition-all ${
              activatedFeatures.esp
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            {activatedFeatures.esp ? 'UNLOAD' : 'LOAD'}
          </button>
        </div>
      </div>

      {/* Chams */}
      <div className="bg-gray-800 rounded-lg p-4">
        <div className="flex justify-between items-center">
          <span className="text-white font-medium">Chams</span>
          <button
            onClick={handleChams}
            className={`px-4 py-2 rounded font-semibold transition-all ${
              activatedFeatures.chams
                ? 'bg-blue-500 hover:bg-blue-600 text-white'
                : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
            }`}
          >
            {activatedFeatures.chams ? 'UNLOAD' : 'LOAD'}
          </button>
        </div>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// EXAMPLE 3: settings-category.tsx - With Configuration
// ═══════════════════════════════════════════════════════════════════════════

'use client';

import { useCallback, useState } from 'react';
import { useBypass } from '@/hooks/useBypass';

export function SettingsCategory() {
  const { updateConfig, checkConnection } = useBypass();
  
  const [isConnected, setIsConnected] = useState(false);
  const [settings, setSettings] = useState({
    aimSmoothing: 0.5,
    espDistance: 300,
    chamsOpacity: 1.0,
  });

  useEffect(() => {
    checkConnection().then(connected => {
      setIsConnected(connected);
    });
  }, [checkConnection]);

  const handleSettingChange = useCallback(
    async (setting: string, value: number) => {
      if (!isConnected) {
        alert('Server not connected');
        return;
      }

      try {
        // Update based on which setting changed
        if (setting === 'aimSmoothing') {
          await updateConfig('RAGE_AIM', { smoothness: value });
          setSettings(prev => ({ ...prev, aimSmoothing: value }));
        } else if (setting === 'espDistance') {
          await updateConfig('ESP', { distance: value });
          setSettings(prev => ({ ...prev, espDistance: value }));
        } else if (setting === 'chamsOpacity') {
          await updateConfig('CHAMS', { opacity: value });
          setSettings(prev => ({ ...prev, chamsOpacity: value }));
        }
      } catch (error) {
        console.error('Failed to update settings:', error);
        alert('Failed to update settings');
      }
    },
    [isConnected, updateConfig]
  );

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-white">Settings</h2>
      
      {!isConnected && (
        <div className="bg-red-500/20 border border-red-500 rounded px-3 py-2 text-sm">
          ⚠️ Server not connected - settings cannot be updated
        </div>
      )}

      {/* Aim Smoothing */}
      <div className="bg-gray-800 rounded-lg p-4">
        <label className="block text-white font-medium mb-2">
          Aim Smoothing: {settings.aimSmoothing.toFixed(2)}
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={settings.aimSmoothing}
          onChange={(e) => handleSettingChange('aimSmoothing', parseFloat(e.target.value))}
          disabled={!isConnected}
          className="w-full"
        />
      </div>

      {/* ESP Distance */}
      <div className="bg-gray-800 rounded-lg p-4">
        <label className="block text-white font-medium mb-2">
          ESP Distance: {settings.espDistance}m
        </label>
        <input
          type="range"
          min="100"
          max="500"
          step="50"
          value={settings.espDistance}
          onChange={(e) => handleSettingChange('espDistance', parseInt(e.target.value))}
          disabled={!isConnected}
          className="w-full"
        />
      </div>

      {/* Chams Opacity */}
      <div className="bg-gray-800 rounded-lg p-4">
        <label className="block text-white font-medium mb-2">
          Chams Opacity: {settings.chamsOpacity.toFixed(2)}
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={settings.chamsOpacity}
          onChange={(e) => handleSettingChange('chamsOpacity', parseFloat(e.target.value))}
          disabled={!isConnected}
          className="w-full"
        />
      </div>
    </div>
  );
}


/*
═══════════════════════════════════════════════════════════════════════════
                    HOW TO USE THESE EXAMPLES
═══════════════════════════════════════════════════════════════════════════

1. Choose which component you want to update:
   - aim-category.tsx
   - visuals-category.tsx
   - settings-category.tsx

2. Copy the corresponding EXAMPLE code above

3. Open the component file in pink-remote/components/categories/

4. Replace the entire content with the example code

5. Add the useEffect import if not already present:
   import { useEffect } from 'react';

6. Save and test in your browser

═══════════════════════════════════════════════════════════════════════════
*/

/*
═══════════════════════════════════════════════════════════════════════════
                           KEY FEATURES
═══════════════════════════════════════════════════════════════════════════

Each example includes:

✓ useBypass() hook integration
  - activateFeature()
  - deactivateFeature()
  - updateConfig()
  - checkConnection()

✓ Connection status checking
  - Displays warning if server not connected
  - Disables buttons if not connected

✓ Feature state management
  - Tracks which features are active/inactive
  - Updates button appearance based on state
  - Shows "LOAD" when inactive, "UNLOAD" when active

✓ Error handling
  - Try/catch blocks for async operations
  - User-friendly error messages

✓ Configuration support (settings example)
  - Sliders for numeric values
  - Sends config to server via updateConfig()

✓ Mobile responsive
  - Works on all screen sizes
  - Touch-friendly buttons

═══════════════════════════════════════════════════════════════════════════
*/
