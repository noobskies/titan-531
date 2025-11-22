import { Capacitor } from "@capacitor/core";

/**
 * Check if the app is running in a native environment (Capacitor)
 * @returns true if running in native app, false if running in web browser
 */
export const isNativeApp = (): boolean => {
  return Capacitor.isNativePlatform();
};

/**
 * Check if the app is running on Android
 * @returns true if running on Android platform
 */
export const isAndroid = (): boolean => {
  return Capacitor.getPlatform() === "android";
};

/**
 * Check if the app is running in a web browser
 * @returns true if running in web browser, false if in native app
 */
export const isWeb = (): boolean => {
  return Capacitor.getPlatform() === "web";
};

/**
 * Get the current platform
 * @returns 'web', 'android', or 'ios'
 */
export const getPlatform = (): string => {
  return Capacitor.getPlatform();
};
