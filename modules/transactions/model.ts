import { mysqlQuery, sql, MysqlSession } from '@/lib/mysql';

export interface Transaction {
  fromTenantId: number,
  fromAccountId: number,
  fromCurrencyCode: string,
  fromAmount: number,
  fromCryptoFractional?: number,

  toTenantId: number,
  toAccountId: number,
  toCurrencyCode: string,
  toAmount: number,
  toCryptoFractional?: number,

  code?: string,
  reference?: string,
  exchangeRate?: number,
}

export interface TransactionItem extends Transaction {
  id: number,
  createdAt: Date,
}

export async function getTransactionById(transactionId: number): Promise<TransactionItem | undefined> {
  const selectQuery = sql.select().from('Transaction').where('id = ?', transactionId);
  return (await mysqlQuery<TransactionItem>(selectQuery)).first();
}

export async function findTransactionsFromTenant(fromTenantId: number): Promise<TransactionItem[]> {
  const selectQuery = sql.select().from('Transaction').where('fromTenantId = ?', fromTenantId);
  const { rows } = await mysqlQuery<TransactionItem>(selectQuery);
  return rows;
}

export async function findTransactionsToTenant(toTenantId: number): Promise<TransactionItem[]> {
  const selectQuery = sql.select().from('Transaction').where('toTenantId = ?', toTenantId);
  const { rows } = await mysqlQuery<TransactionItem>(selectQuery);
  return rows;
}

export async function createTransaction(create: Transaction, session?: MysqlSession): Promise<number> {
  const insertQuery = sql.insert().into('Transaction').setFields(create);
  const { insertId } = await mysqlQuery(insertQuery, session);
  return insertId;
}

export async function deleteTransactionById(transactionId: number, session?: MysqlSession): Promise<boolean> {
  const deleteQuery = sql.delete().from('Transaction').where('id = ?', transactionId);
  const { affectedRows } = await mysqlQuery(deleteQuery, session);
  return affectedRows === 1;
}
