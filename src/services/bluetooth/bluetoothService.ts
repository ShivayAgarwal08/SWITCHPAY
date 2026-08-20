/**
 * Bluetooth Low Energy Service
 * 
 * Main service for BLE operations in SwitchPay offline payments.
 * Handles device discovery, connection, and message exchange.
 */

import {BleManager} from 'react-native-ble-plx';
import type {
  BLEDevice,
  BLEState,
  ConnectionState,
  BLEConnectionResult,
  BLEResult,
  BLEScanResult,
  BLEMessageResult,
  BLEConfig,
  BLEAdapterState,
} from './bluetoothTypes';
import {
  SWITCHPAY_BLE_UUIDS,
  serializeMessage,
  parseMessage,
  type SwitchPayBLEMessage,
} from './bluetoothProtocol';
import {requestBLEPermissions, hasRequiredBLEPermissions} from './bluetoothPermissions';

/**
 * BLE Service Configuration
 */
const DEFAULT_CONFIG: BLEConfig = {
  serviceUUID: SWITCHPAY_BLE_UUIDS.SERVICE,
  characteristicUUID: SWITCHPAY_BLE_UUIDS.WRITE_CHARACTERISTIC,
  scanTimeout: 15000, // 15 seconds
  connectionTimeout: 10000, // 10 seconds
  messageTimeout: 30000, // 30 seconds
  advertisingInterval: 100, // 100ms
};

/**
 * Main BLE Service
 */
class BluetoothService {
  private bleManager: any | null = null;
  private config: BLEConfig;
  private currentDevice: BLEDevice | null = null;
  private connectionState: ConnectionState = 'DISCONNECTED';
  private scanCleanup: (() => void) | null = null;
  private messageHandlers: Map<string, (message: SwitchPayBLEMessage) => void> = new Map();
  private activeTransactionIds: Set<string> = new Set();

  constructor(config: BLEConfig = DEFAULT_CONFIG) {
    this.config = config;
  }

  /**
   * Initialize the BLE manager
   */
  async initialize(): Promise<BLEResult> {
    try {
      if (this.bleManager) {
        return {success: true};
      }

      // Check permissions first
      const hasPermissions = await hasRequiredBLEPermissions();
      if (!hasPermissions) {
        const permissionStatus = await requestBLEPermissions();
        if (!permissionStatus.canScan || !permissionStatus.canConnect) {
          return {
            success: false,
            error: 'Required BLE permissions not granted',
          };
        }
      }

      // Create BLE manager
      this.bleManager = new BleManager();

      // Set up state listener
      this.bleManager.stateChange().subscribe((state: any) => {
        console.log('BLE state changed:', state);
      });

      return {success: true};
    } catch (error) {
      return {
        success: false,
        error: `Failed to initialize BLE: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get current BLE adapter state
   */
  async getAdapterState(): Promise<BLEAdapterState> {
    if (!this.bleManager) {
      return {
        state: 'UNKNOWN',
        isAvailable: false,
        isPoweredOn: false,
      };
    }

    try {
      const state = await this.bleManager.state();
      return {
        state: this.mapBleState(state),
        isAvailable: state !== 'UNSUPPORTED' && state !== 'UNAUTHORIZED',
        isPoweredOn: state === 'POWERED_ON',
      };
    } catch {
      return {
        state: 'UNKNOWN',
        isAvailable: false,
        isPoweredOn: false,
      };
    }
  }

  /**
   * Map react-native-ble-plx state to our BLEState type
   */
  private mapBleState(state: string): BLEState {
    const stateMap: Record<string, BLEState> = {
      'Unknown': 'UNKNOWN',
      'Unauthorized': 'UNAUTHORIZED',
      'PoweredOff': 'POWERED_OFF',
      'PoweredOn': 'POWERED_ON',
      'Resetting': 'RESETTING',
      'Unsupported': 'UNSUPPORTED',
    };
    return stateMap[state] || 'UNKNOWN';
  }

  /**
   * Check if Bluetooth is available and powered on
   */
  async isBluetoothAvailable(): Promise<boolean> {
    const adapterState = await this.getAdapterState();
    return adapterState.isAvailable && adapterState.isPoweredOn;
  }

  /**
   * Scan for SwitchPay devices
   */
  async scanForDevices(targetSwitchPayId: string): Promise<BLEScanResult> {
    if (!this.bleManager) {
      await this.initialize();
    }

    if (!this.bleManager) {
      return {
        devices: [],
        foundTarget: false,
      };
    }

    const isAvailable = await this.isBluetoothAvailable();
    if (!isAvailable) {
      throw new Error('Bluetooth is not available or powered on');
    }

    const devices: BLEDevice[] = [];
    let foundTarget = false;
    let targetDevice: BLEDevice | undefined;

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.stopScanning();
        resolve({
          devices,
          foundTarget,
          targetDevice,
        });
      }, this.config.scanTimeout);

      try {
        this.bleManager!.startDeviceScan(
          [this.config.serviceUUID],
          {allowDuplicates: false},
          (error: any, device: any) => {
            if (error) {
              clearTimeout(timeout);
              this.stopScanning();
              reject(new Error(`Scan error: ${error.message}`));
              return;
            }

            if (device) {
              const bleDevice: BLEDevice = {
                id: device.id,
                name: device.name,
                rssi: device.rssi,
                localName: device.localName,
              };

              // Try to extract SwitchPay ID from device name or advertising data
              const switchPayId = this.extractSwitchPayId(device);
              if (switchPayId) {
                bleDevice.switchPayId = switchPayId;
              }

              devices.push(bleDevice);

              // Check if this is our target device
              if (switchPayId === targetSwitchPayId) {
                foundTarget = true;
                targetDevice = bleDevice;
                clearTimeout(timeout);
                this.stopScanning();
                resolve({
                  devices,
                  foundTarget,
                  targetDevice,
                });
              }
            }
          }
        );

        this.scanCleanup = () => {
          this.bleManager!.stopDeviceScan();
        };
      } catch (error) {
        clearTimeout(timeout);
        reject(new Error(`Failed to start scan: ${error instanceof Error ? error.message : 'Unknown error'}`));
      }
    });
  }

  /**
   * Stop scanning for devices
   */
  stopScanning(): void {
    if (this.scanCleanup) {
      this.scanCleanup();
      this.scanCleanup = null;
    }
  }

  /**
   * Extract SwitchPay ID from device advertising data
   */
  private extractSwitchPayId(device: any): string | undefined {
    // Try to get SwitchPay ID from device name
    if (device.name && device.name.startsWith('SWP-')) {
      return device.name;
    }

    // Try to get from local name
    if (device.localName && device.localName.startsWith('SWP-')) {
      return device.localName;
    }

    // Try to get from advertising data
    if (device.advertising) {
      const advertisingData = device.advertising;
      if (advertisingData.localName && advertisingData.localName.startsWith('SWP-')) {
        return advertisingData.localName;
      }
      
      // Check service data for SwitchPay ID
      if (advertisingData.serviceData) {
        for (const serviceUuid in advertisingData.serviceData) {
          const data = advertisingData.serviceData[serviceUuid];
          if (data && typeof data === 'string' && data.startsWith('SWP-')) {
            return data;
          }
        }
      }
    }

    return undefined;
  }

  /**
   * Connect to a BLE device
   */
  async connectToDevice(device: BLEDevice): Promise<BLEConnectionResult> {
    if (!this.bleManager) {
      return {
        success: false,
        error: 'BLE manager not initialized',
      };
    }

    this.connectionState = 'CONNECTING';

    try {
      const connection = await this.bleManager.connectToDevice(device.id);
      
      // Discover services and characteristics
      await connection.discoverAllServicesAndCharacteristics();
      
      // Verify the SwitchPay service is present
      const services = await connection.services();
      const hasSwitchPayService = services.some(
        (service: any) => service.uuid.toLowerCase() === this.config.serviceUUID.toLowerCase()
      );

      if (!hasSwitchPayService) {
        await connection.cancelConnection();
        return {
          success: false,
          error: 'SwitchPay service not found on device',
        };
      }

      this.currentDevice = device;
      this.connectionState = 'CONNECTED';

      // Set up notification listener
      await this.setupNotificationListener(connection);

      return {
        success: true,
        device,
      };
    } catch (error) {
      this.connectionState = 'DISCONNECTED';
      return {
        success: false,
        error: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Set up notification listener for incoming messages
   */
  private async setupNotificationListener(connection: any): Promise<void> {
    try {
      await connection.monitorCharacteristic(
        this.config.serviceUUID,
        SWITCHPAY_BLE_UUIDS.NOTIFY_CHARACTERISTIC,
        (error: any, characteristic: any) => {
          if (error) {
            console.error('Notification error:', error);
            return;
          }

          if (characteristic && characteristic.value) {
            try {
              const messageString = characteristic.value;
              const message = parseMessage(messageString);
              this.handleIncomingMessage(message);
            } catch (parseError) {
              console.error('Failed to parse incoming message:', parseError);
            }
          }
        }
      );
    } catch (error) {
      console.error('Failed to set up notification listener:', error);
    }
  }

  /**
   * Handle incoming BLE message
   */
  private handleIncomingMessage(message: SwitchPayBLEMessage): void {
    // Check for duplicate transaction IDs
    if (this.activeTransactionIds.has(message.transactionId)) {
      console.log('Duplicate transaction ID ignored:', message.transactionId);
      return;
    }

    // Add to active transactions
    this.activeTransactionIds.add(message.transactionId);

    // Call registered message handler
    const handler = this.messageHandlers.get(message.type);
    if (handler) {
      handler(message);
    }
  }

  /**
   * Register a message handler for a specific message type
   */
  onMessage(messageType: string, handler: (message: SwitchPayBLEMessage) => void): void {
    this.messageHandlers.set(messageType, handler);
  }

  /**
   * Remove a message handler
   */
  offMessage(messageType: string): void {
    this.messageHandlers.delete(messageType);
  }

  /**
   * Send a message to the connected device
   */
  async sendMessage(message: SwitchPayBLEMessage): Promise<BLEMessageResult> {
    if (!this.bleManager || !this.currentDevice) {
      return {
        success: false,
        error: 'Not connected to any device',
      };
    }

    if (this.connectionState !== 'CONNECTED') {
      return {
        success: false,
        error: 'Device not connected',
      };
    }

    try {
      const connection = await this.bleManager.getConnectedDevices([this.config.serviceUUID]);
      if (connection.length === 0) {
        return {
          success: false,
          error: 'No active connection found',
        };
      }

      const deviceConnection = connection[0];
      const serializedMessage = serializeMessage(message);

      await deviceConnection.writeCharacteristic(
        this.config.serviceUUID,
        SWITCHPAY_BLE_UUIDS.WRITE_CHARACTERISTIC,
        serializedMessage,
        false
      );

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to send message: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Disconnect from the current device
   */
  async disconnect(): Promise<BLEResult> {
    if (!this.bleManager || !this.currentDevice) {
      return {success: true};
    }

    try {
      await this.bleManager.cancelDeviceConnection(this.currentDevice.id);
      this.currentDevice = null;
      this.connectionState = 'DISCONNECTED';
      return {success: true};
    } catch (error) {
      this.currentDevice = null;
      this.connectionState = 'DISCONNECTED';
      return {
        success: false,
        error: `Disconnect failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Get current connection state
   */
  getConnectionState(): ConnectionState {
    return this.connectionState;
  }

  /**
   * Get current connected device
   */
  getCurrentDevice(): BLEDevice | null {
    return this.currentDevice;
  }

  /**
   * Clean up resources
   */
  async destroy(): Promise<void> {
    this.stopScanning();
    await this.disconnect();
    this.messageHandlers.clear();
    this.activeTransactionIds.clear();
    
    if (this.bleManager) {
      this.bleManager.destroy();
      this.bleManager = null;
    }
  }

  /**
   * Mark transaction as completed and remove from active set
   */
  markTransactionComplete(transactionId: string): void {
    this.activeTransactionIds.delete(transactionId);
  }

  /**
   * Check if a transaction is currently being processed
   */
  isTransactionActive(transactionId: string): boolean {
    return this.activeTransactionIds.has(transactionId);
  }
}

// Export singleton instance
export const bluetoothService = new BluetoothService();

// Export class for testing
export {BluetoothService};