import { useState, useEffect, useCallback } from 'react';

// Define the structure for a single feature's configuration
export type FeatureConfig = Record<string, number | boolean | string>;

// Define the global configuration structure
export type GlobalConfig = Record<string, FeatureConfig>;

const STORAGE_KEY = 'effikit_global_config';

/**
 * A hook for managing global extension configuration using chrome.storage.sync.
 * It provides methods to get and set configuration for different features.
 */
export function useGlobalConfig() {
  const [config, setConfig] = useState<GlobalConfig>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load initial config from chrome.storage on mount
  useEffect(() => {
    if (!chrome.storage) {
      setError('Chrome Storage API is not available.');
      setIsLoading(false);
      return;
    }

    chrome.storage.sync.get(STORAGE_KEY, (result) => {
      if (chrome.runtime.lastError) {
        setError(chrome.runtime.lastError.message || 'Failed to load config.');
      } else {
        setConfig(result[STORAGE_KEY] || {});
      }
      setIsLoading(false);
    });

    // Listen for changes in storage
    const storageChangedListener = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
      if (areaName === 'sync' && changes[STORAGE_KEY]) {
        setConfig(changes[STORAGE_KEY].newValue || {});
      }
    };

    chrome.storage.onChanged.addListener(storageChangedListener);

    return () => {
      chrome.storage.onChanged.removeListener(storageChangedListener);
    };
  }, []);

  /**
   * Retrieves the configuration for a specific feature.
   * @param featureName The name of the feature.
   * @returns The configuration object for the feature, or an empty object if not found.
   */
  const getFeatureConfig = useCallback((featureName: string): FeatureConfig => {
    return config[featureName] || {};
  }, [config]);

  /**
   * Sets or updates the configuration for a specific feature.
   * This will merge the new config with the existing global config and save it.
   * @param featureName The name of the feature to configure.
   * @param featureConfig The new configuration object for the feature.
   * @returns A promise that resolves when the config is saved, or rejects on error.
   */
  const setFeatureConfig = useCallback(async (featureName: string, featureConfig: FeatureConfig): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!chrome.storage) {
        const err = 'Chrome Storage API is not available.';
        setError(err);
        reject(new Error(err));
        return;
      }

      // Create the new global config state by merging
      const newGlobalConfig = {
        ...config,
        [featureName]: featureConfig,
      };

      chrome.storage.sync.set({ [STORAGE_KEY]: newGlobalConfig }, () => {
        if (chrome.runtime.lastError) {
          const err = chrome.runtime.lastError.message || 'Failed to save config.';
          setError(err);
          reject(new Error(err));
        } else {
          // The listener will update the state, but we can also set it here for immediate feedback
          setConfig(newGlobalConfig);
          resolve();
        }
      });
    });
  }, [config]);

  /**
   * Clears the configuration for a specific feature.
   * @param featureName The name of the feature to clear.
   * @returns A promise that resolves when the config is cleared, or rejects on error.
   */
  const clearFeatureConfig = useCallback(async (featureName: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!chrome.storage) {
        const err = 'Chrome Storage API is not available.';
        setError(err);
        reject(new Error(err));
        return;
      }

      const newGlobalConfig = { ...config };
      delete newGlobalConfig[featureName];

      chrome.storage.sync.set({ [STORAGE_KEY]: newGlobalConfig }, () => {
        if (chrome.runtime.lastError) {
          const err = chrome.runtime.lastError.message || 'Failed to clear config.';
          setError(err);
          reject(new Error(err));
        } else {
          setConfig(newGlobalConfig);
          resolve();
        }
      });
    });
  }, [config]);

  return {
    config,
    isLoading,
    error,
    getFeatureConfig,
    setFeatureConfig,
    clearFeatureConfig,
  };
}
