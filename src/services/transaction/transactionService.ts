import type {Transaction} from '../../models';
import {storageService} from '../storage/storageService';

const TRANSACTIONS_KEY = '@switchpay_transactions';

export const transactionService = {
  async saveTransactions(transactions: Transaction[]): Promise<void> {
    await storageService.setItem(TRANSACTIONS_KEY, transactions);
  },

  async loadTransactions(): Promise<Transaction[]> {
    const txs = await storageService.getItem<Transaction[]>(TRANSACTIONS_KEY);
    return txs || [];
  },

  async addTransaction(transaction: Transaction): Promise<void> {
    const txs = await this.loadTransactions();
    txs.unshift(transaction); // Add to beginning (latest first)
    await this.saveTransactions(txs);
  },
};
