/**
 * SwitchPay BLE Protocol
 * 
 * Defines the message protocol for Bluetooth Low Energy communication
 * between SwitchPay devices for offline payments.
 */

export type MessageType = 'PAYMENT_REQUEST' | 'PAYMENT_ACCEPTED' | 'PAYMENT_REJECTED' | 'PAYMENT_ACK' | 'ERROR';

export interface SwitchPayBLEMessage {
  type: MessageType;
  transactionId: string;
  senderSwitchPayId: string;
  receiverSwitchPayId: string;
  amount: number;
  timestamp: number;
  errorMessage?: string;
}

export interface PaymentRequestMessage extends SwitchPayBLEMessage {
  type: 'PAYMENT_REQUEST';
}

export interface PaymentAcceptedMessage extends SwitchPayBLEMessage {
  type: 'PAYMENT_ACCEPTED';
}

export interface PaymentRejectedMessage extends SwitchPayBLEMessage {
  type: 'PAYMENT_REJECTED';
  errorMessage?: string;
}

export interface PaymentAckMessage extends SwitchPayBLEMessage {
  type: 'PAYMENT_ACK';
}

export interface ErrorMessage extends SwitchPayBLEMessage {
  type: 'ERROR';
  errorMessage: string;
}

/**
 * Protocol constants
 */
export const PROTOCOL_CONSTANTS = {
  MAX_MESSAGE_SIZE: 2048, // bytes (increased for safety)
  MESSAGE_TIMEOUT: 30000, // 30 seconds
  TRANSACTION_ID_LENGTH: 36, // UUID v4 length
  SWITCHPAY_ID_PREFIX: 'SWP-',
  SWITCHPAY_ID_LENGTH: 12, // e.g., SWP-AAAA1111
} as const;

/**
 * Service and Characteristic UUIDs for SwitchPay BLE
 */
export const SWITCHPAY_BLE_UUIDS = {
  SERVICE: '6E400001-B5A3-F393-E0A9-E50E24DCCA9E',
  WRITE_CHARACTERISTIC: '6E400002-B5A3-F393-E0A9-E50E24DCCA9E',
  NOTIFY_CHARACTERISTIC: '6E400003-B5A3-F393-E0A9-E50E24DCCA9E',
} as const;

/**
 * Validates a SwitchPay ID format
 */
export function isValidSwitchPayId(switchPayId: string): boolean {
  if (!switchPayId || typeof switchPayId !== 'string') {
    return false;
  }
  
  // Check format: SWP-XXXXYYYY where X is letter, Y is digit
  const regex = /^SWP-[A-Z]{4}[0-9]{4}$/;
  return regex.test(switchPayId);
}

/**
 * Validates a transaction ID (UUID v4 format)
 */
export function isValidTransactionId(transactionId: string): boolean {
  if (!transactionId || typeof transactionId !== 'string') {
    return false;
  }
  
  // General UUID regex (less strict than v4-specific for prototype)
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(transactionId);
}

/**
 * Serializes a SwitchPay message to JSON string
 */
export function serializeMessage(message: SwitchPayBLEMessage): string {
  try {
    const jsonString = JSON.stringify(message);
    
    // Validate message size (approximate byte length for UTF-8)
    // Each character is approximately 1-4 bytes in UTF-8
    const approximateByteLength = jsonString.length * 3; // Conservative estimate
    if (approximateByteLength > PROTOCOL_CONSTANTS.MAX_MESSAGE_SIZE) {
      throw new Error('Message size exceeds maximum allowed size');
    }
    
    return jsonString;
  } catch (error) {
    throw new Error(`Failed to serialize message: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Parses a JSON string to a SwitchPay message
 */
export function parseMessage(jsonString: string): SwitchPayBLEMessage {
  try {
    if (!jsonString || typeof jsonString !== 'string') {
      throw new Error('Invalid message format: empty or not a string');
    }
    
    const message = JSON.parse(jsonString) as SwitchPayBLEMessage;
    
    // Validate required fields
    if (!message.type || !message.transactionId || !message.senderSwitchPayId || 
        !message.receiverSwitchPayId || message.amount === undefined || !message.timestamp) {
      throw new Error('Invalid message: missing required fields');
    }
    
    // Validate message type
    const validTypes: MessageType[] = ['PAYMENT_REQUEST', 'PAYMENT_ACCEPTED', 'PAYMENT_REJECTED', 'PAYMENT_ACK', 'ERROR'];
    if (!validTypes.includes(message.type)) {
      throw new Error(`Invalid message type: ${message.type}`);
    }
    
    // Validate SwitchPay IDs
    if (!isValidSwitchPayId(message.senderSwitchPayId)) {
      throw new Error(`Invalid sender SwitchPay ID: ${message.senderSwitchPayId}`);
    }
    
    if (!isValidSwitchPayId(message.receiverSwitchPayId)) {
      throw new Error(`Invalid receiver SwitchPay ID: ${message.receiverSwitchPayId}`);
    }
    
    // Validate transaction ID
    if (!isValidTransactionId(message.transactionId)) {
      throw new Error(`Invalid transaction ID: ${message.transactionId}`);
    }
    
    // Validate amount
    if (typeof message.amount !== 'number' || message.amount <= 0) {
      throw new Error(`Invalid amount: ${message.amount}`);
    }
    
    // Validate timestamp
    if (typeof message.timestamp !== 'number' || message.timestamp <= 0) {
      throw new Error(`Invalid timestamp: ${message.timestamp}`);
    }
    
    // Validate error message for ERROR type
    if (message.type === 'ERROR' && !message.errorMessage) {
      throw new Error('ERROR message type requires errorMessage field');
    }
    
    return message;
  } catch (error) {
    throw new Error(`Failed to parse message: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Creates a payment request message
 */
export function createPaymentRequest(
  transactionId: string,
  senderSwitchPayId: string,
  receiverSwitchPayId: string,
  amount: number
): PaymentRequestMessage {
  return {
    type: 'PAYMENT_REQUEST',
    transactionId,
    senderSwitchPayId,
    receiverSwitchPayId,
    amount,
    timestamp: Date.now(),
  };
}

/**
 * Creates a payment accepted message
 */
export function createPaymentAccepted(
  transactionId: string,
  senderSwitchPayId: string,
  receiverSwitchPayId: string,
  amount: number
): PaymentAcceptedMessage {
  return {
    type: 'PAYMENT_ACCEPTED',
    transactionId,
    senderSwitchPayId,
    receiverSwitchPayId,
    amount,
    timestamp: Date.now(),
  };
}

/**
 * Creates a payment rejected message
 */
export function createPaymentRejected(
  transactionId: string,
  senderSwitchPayId: string,
  receiverSwitchPayId: string,
  amount: number,
  errorMessage?: string
): PaymentRejectedMessage {
  return {
    type: 'PAYMENT_REJECTED',
    transactionId,
    senderSwitchPayId,
    receiverSwitchPayId,
    amount,
    timestamp: Date.now(),
    errorMessage,
  };
}

/**
 * Creates a payment acknowledgement message
 */
export function createPaymentAck(
  transactionId: string,
  senderSwitchPayId: string,
  receiverSwitchPayId: string,
  amount: number
): PaymentAckMessage {
  return {
    type: 'PAYMENT_ACK',
    transactionId,
    senderSwitchPayId,
    receiverSwitchPayId,
    amount,
    timestamp: Date.now(),
  };
}

/**
 * Creates an error message
 */
export function createError(
  transactionId: string,
  senderSwitchPayId: string,
  receiverSwitchPayId: string,
  amount: number,
  errorMessage: string
): ErrorMessage {
  return {
    type: 'ERROR',
    transactionId,
    senderSwitchPayId,
    receiverSwitchPayId,
    amount,
    timestamp: Date.now(),
    errorMessage,
  };
}