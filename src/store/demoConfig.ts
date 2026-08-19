import type {Merchant, Transaction} from '../models';

/**
 * Static demo values for the Phase 2 UI. No balance here is mutated: wallet
 * logic and the transaction ledger arrive in later phases.
 */
export const DEMO_CUSTOMER_BALANCE = 2000;
export const DEMO_MERCHANT_BALANCE = 500;
export const DEMO_CUSTOMER_NAME = 'Demo Customer';
export const DEMO_MERCHANT: Merchant = {id: 'MERCHANT_001', name: 'Demo Store'};
export const DEMO_TRANSACTIONS: Transaction[] = [];
