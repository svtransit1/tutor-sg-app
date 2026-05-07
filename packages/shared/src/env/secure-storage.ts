import * as SecureStore from "expo-secure-store";

const STORE_KEYS = {
  MODEL_CDN_SIGNING_KEY: "model_cdn_signing_key",
} as const;

type StoreKey = (typeof STORE_KEYS)[keyof typeof STORE_KEYS];

/**
 * SecureStore service for runtime secrets.
 *
 * Secrets are loaded from expo-secure-store at runtime — never hardcoded,
 * never stored in plain env files, never logged.
 *
 * Use for: model CDN signing keys, auth tokens, API secrets that must not
 * appear in the app bundle.
 */
export const SecureStorage = {
  /**
   * Store a value securely. Overwrites any existing value.
   */
  async set(key: StoreKey, value: string): Promise<void> {
    await SecureStore.setItemAsync(key, value);
  },

  /**
   * Retrieve a stored value. Returns null if not found.
   */
  async get(key: StoreKey): Promise<string | null> {
    return SecureStore.getItemAsync(key);
  },

  /**
   * Delete a stored value.
   */
  async delete(key: StoreKey): Promise<void> {
    await SecureStore.deleteItemAsync(key);
  },

  /**
   * Get MODEL_CDN_SIGNING_KEY, returning null if not yet set.
   * Used by the model downloader when building signed CDN URLs.
   */
  async getModelCdnSigningKey(): Promise<string | null> {
    return this.get(STORE_KEYS.MODEL_CDN_SIGNING_KEY);
  },

  /**
   * Set MODEL_CDN_SIGNING_KEY. Call this once during first-launch onboarding
   * after the user/auth flow provides the key.
   */
  async setModelCdnSigningKey(key: string): Promise<void> {
    await this.set(STORE_KEYS.MODEL_CDN_SIGNING_KEY, key);
  },
};