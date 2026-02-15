import type { Config } from "./features/groups.ts";

/**
 * Serializes a config object to a base64-encoded JSON string
 * suitable for use in a URL hash fragment.
 */
export function configToHash(config: Config): string {
  return btoa(JSON.stringify(config));
}

/**
 * Deserializes a config object from a URL hash fragment.
 * Returns null if the hash is empty, malformed, or invalid JSON.
 *
 * @param hash - The full hash string including the leading '#'
 */
export function configFromHash(hash: string): Config | null {
  if (!hash || hash.length < 2) return null;

  try {
    // Remove leading '#' if present
    const cleaned = hash.startsWith('#') ? hash.slice(1) : hash;
    const json = atob(cleaned);
    const parsed = JSON.parse(json);

    // Basic validation: ensure we have a groups array
    if (!parsed || !Array.isArray(parsed.groups)) {
      console.warn('Invalid config structure in URL hash');
      return null;
    }

    return parsed as Config;
  } catch (error) {
    console.warn('Failed to parse config from URL hash:', error);
    return null;
  }
}

/**
 * Updates the browser's URL hash with the serialized config.
 * Uses replaceState to avoid cluttering browser history.
 */
export function syncConfigToUrl(config: Config): void {
  const hash = '#' + configToHash(config);
  history.replaceState(null, '', hash);
}

/**
 * Loads config from current URL hash, or returns null if not present/invalid.
 */
export function loadConfigFromUrl(): Config | null {
  return configFromHash(window.location.hash);
}