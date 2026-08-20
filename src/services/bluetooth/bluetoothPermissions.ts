/**
 * Bluetooth Permissions Handler
 * 
 * Handles Android runtime permissions for Bluetooth Low Energy operations.
 * This is a platform-specific module that provides permission checking and requesting.
 */

import {Platform, PermissionsAndroid} from 'react-native';
import type {BLEPermissionsStatus} from './bluetoothTypes';

/**
 * Checks if the platform is Android
 */
export function isAndroid(): boolean {
  return Platform.OS === 'android';
}

/**
 * Checks if the platform is iOS
 */
export function isIOS(): boolean {
  return Platform.OS === 'ios';
}

/**
 * Gets the Android API level
 */
export function getAndroidApiLevel(): number {
  if (!isAndroid()) {
    return -1;
  }
  return Platform.Version as number;
}

/**
 * Checks if the app needs to use the new Android 12+ BLE permissions
 */
export function needsNewBLEPermissions(): boolean {
  return isAndroid() && getAndroidApiLevel() >= 31; // Android 12 (API 31)
}

/**
 * Checks if location permission is required for BLE scanning
 */
export function needsLocationPermission(): boolean {
  if (!isAndroid()) {
    return false;
  }
  const apiLevel = getAndroidApiLevel();
  // Location permission is required for BLE scanning on Android < 12
  return apiLevel < 31;
}

/**
 * Checks current BLE permissions status
 */
export async function checkBLEPermissions(): Promise<BLEPermissionsStatus> {
  if (isIOS()) {
    // iOS handles BLE permissions differently - through system dialogs
    // For now, we assume iOS permissions are granted for the prototype
    return {
      scan: true,
      connect: true,
      advertise: true,
      location: true,
      canScan: true,
      canConnect: true,
      canAdvertise: true,
    };
  }

  // Android permission checks
  const permissions: BLEPermissionsStatus = {
    scan: false,
    connect: false,
    advertise: false,
    location: false,
    canScan: false,
    canConnect: false,
    canAdvertise: false,
  };

  try {
    if (needsNewBLEPermissions()) {
      // Android 12+ (API 31+)
      const [scanResult, connectResult, advertiseResult] = await Promise.all([
        PermissionsAndroid.check('android.permission.BLUETOOTH_SCAN'),
        PermissionsAndroid.check('android.permission.BLUETOOTH_CONNECT'),
        PermissionsAndroid.check('android.permission.BLUETOOTH_ADVERTISE'),
      ]);

      permissions.scan = scanResult;
      permissions.connect = connectResult;
      permissions.advertise = advertiseResult;
      permissions.location = true; // Not required on Android 12+
    } else {
      // Android < 12
      const [bluetoothResult, adminResult, locationResult] = await Promise.all([
        PermissionsAndroid.check('android.permission.BLUETOOTH' as any),
        PermissionsAndroid.check('android.permission.BLUETOOTH_ADMIN' as any),
        PermissionsAndroid.check('android.permission.ACCESS_FINE_LOCATION'),
      ]);

      permissions.scan = bluetoothResult && adminResult && locationResult;
      permissions.connect = bluetoothResult && adminResult;
      permissions.advertise = bluetoothResult && adminResult;
      permissions.location = locationResult;
    }

    // Determine overall capabilities
    permissions.canScan = permissions.scan && (needsNewBLEPermissions() || permissions.location);
    permissions.canConnect = permissions.connect;
    permissions.canAdvertise = permissions.advertise;
  } catch (error) {
    console.error('Error checking BLE permissions:', error);
  }

  return permissions;
}

/**
 * Requests BLE permissions from the user
 */
export async function requestBLEPermissions(): Promise<BLEPermissionsStatus> {
  if (isIOS()) {
    // iOS handles permissions through system dialogs when BLE is first used
    return await checkBLEPermissions();
  }

  try {
    if (needsNewBLEPermissions()) {
      // Android 12+ (API 31+)
      const [scanResult, connectResult, advertiseResult] = await Promise.all([
        PermissionsAndroid.request('android.permission.BLUETOOTH_SCAN'),
        PermissionsAndroid.request('android.permission.BLUETOOTH_CONNECT'),
        PermissionsAndroid.request('android.permission.BLUETOOTH_ADVERTISE'),
      ]);

      return {
        scan: scanResult === PermissionsAndroid.RESULTS.GRANTED,
        connect: connectResult === PermissionsAndroid.RESULTS.GRANTED,
        advertise: advertiseResult === PermissionsAndroid.RESULTS.GRANTED,
        location: true,
        canScan: scanResult === PermissionsAndroid.RESULTS.GRANTED,
        canConnect: connectResult === PermissionsAndroid.RESULTS.GRANTED,
        canAdvertise: advertiseResult === PermissionsAndroid.RESULTS.GRANTED,
      };
    } else {
      // Android < 12
      const locationResult = await PermissionsAndroid.request(
        'android.permission.ACCESS_FINE_LOCATION'
      );

      const bluetoothResult = await PermissionsAndroid.request(
        'android.permission.BLUETOOTH' as any
      );

      const adminResult = await PermissionsAndroid.request(
        'android.permission.BLUETOOTH_ADMIN' as any
      );

      const scanGranted = locationResult === PermissionsAndroid.RESULTS.GRANTED &&
                         bluetoothResult === PermissionsAndroid.RESULTS.GRANTED &&
                         adminResult === PermissionsAndroid.RESULTS.GRANTED;

      return {
        scan: scanGranted,
        connect: bluetoothResult === PermissionsAndroid.RESULTS.GRANTED && 
                adminResult === PermissionsAndroid.RESULTS.GRANTED,
        advertise: bluetoothResult === PermissionsAndroid.RESULTS.GRANTED && 
                  adminResult === PermissionsAndroid.RESULTS.GRANTED,
        location: locationResult === PermissionsAndroid.RESULTS.GRANTED,
        canScan: scanGranted,
        canConnect: bluetoothResult === PermissionsAndroid.RESULTS.GRANTED && 
                   adminResult === PermissionsAndroid.RESULTS.GRANTED,
        canAdvertise: bluetoothResult === PermissionsAndroid.RESULTS.GRANTED && 
                     adminResult === PermissionsAndroid.RESULTS.GRANTED,
      };
    }
  } catch (error) {
    console.error('Error requesting BLE permissions:', error);
    return await checkBLEPermissions();
  }
}

/**
 * Checks if all required BLE permissions are granted
 */
export async function hasRequiredBLEPermissions(): Promise<boolean> {
  const status = await checkBLEPermissions();
  return status.canScan && status.canConnect;
}

/**
 * Checks if advertising permissions are granted
 */
export async function hasAdvertisingPermissions(): Promise<boolean> {
  const status = await checkBLEPermissions();
  return status.canAdvertise;
}