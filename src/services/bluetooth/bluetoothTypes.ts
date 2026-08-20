/**
 * BLE Service Type Definitions
 * 
 * Defines the types and interfaces used throughout the BLE service layer
 * for SwitchPay offline payment transport.
 */

export type BLEState = 'UNKNOWN' | 'UNAUTHORIZED' | 'POWERED_OFF' | 'POWERED_ON' | 'RESETTING' | 'UNSUPPORTED';

export type ConnectionState = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'DISCONNECTING';

export type DeviceMatchStatus = 'NOT_FOUND' | 'FOUND' | 'MULTIPLE_FOUND';

export interface BLEDevice {
  id: string;
  name: string | null;
  rssi: number;
  switchPayId?: string;
  localName?: string;
}

export interface BLEServiceInfo {
  uuid: string;
  characteristics: string[];
}

export interface BLEConnectionResult {
  success: boolean;
  error?: string;
  device?: BLEDevice;
}

export interface BLEResult {
  success: boolean;
  error?: string;
}

export interface BLEScanResult {
  devices: BLEDevice[];
  foundTarget: boolean;
  targetDevice?: BLEDevice;
}

export interface BLEMessageResult {
  success: boolean;
  error?: string;
  response?: any;
}

export interface BLEPermissionsStatus {
  scan: boolean;
  connect: boolean;
  advertise: boolean;
  location: boolean;
  canScan: boolean;
  canConnect: boolean;
  canAdvertise: boolean;
}

export interface BLEConfig {
  serviceUUID: string;
  characteristicUUID: string;
  scanTimeout: number;
  connectionTimeout: number;
  messageTimeout: number;
  advertisingInterval: number;
}

export interface BLEAdapterState {
  state: BLEState;
  isAvailable: boolean;
  isPoweredOn: boolean;
}