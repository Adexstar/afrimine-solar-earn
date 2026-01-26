/**
 * Device ID Utility
 * 
 * Generates and persists a unique device ID for mining identification.
 * Uses crypto.randomUUID() for generation, localStorage for persistence.
 */

const DEVICE_ID_KEY = 'afrimine_device_id';

/**
 * Gets or generates a persistent device ID
 */
export function getOrCreateDeviceId(): string {
  let deviceId = localStorage.getItem(DEVICE_ID_KEY);
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem(DEVICE_ID_KEY, deviceId);
  }
  return deviceId;
}

/**
 * Gets current device ID or null if not yet generated
 */
export function getDeviceId(): string | null {
  return localStorage.getItem(DEVICE_ID_KEY);
}
