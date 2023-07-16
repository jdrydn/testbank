import { mysqlQuery, sql, MysqlSession } from '@/lib/mysql';
import { CurrencyCode } from '@/modules/currencies/static';

export interface Transaction {
  fromTenantId: number,
  fromAccountId: number,
  fromCurrencyCode: CurrencyCode,
  fromAmount: number,
  fromCryptoFractional?: number,

  toTenantId: number,
  toAccountId: number,
  toCurrencyCode: CurrencyCode,
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

export async function getTransactionById(id: number): Promise<TransactionItem | undefined> {
  const selectQuery = sql.select().from('Transaction').where({ id });
  return (await mysqlQuery<TransactionItem>(selectQuery)).first();
}

export async function findTransactionsFromTenant(fromTenantId: number): Promise<TransactionItem[]> {
  const selectQuery = sql.select().from('Transaction').where({ fromTenantId });
  const { rows } = await mysqlQuery<TransactionItem>(selectQuery);
  return rows;
}

export async function findTransactionsToTenant(toTenantId: number): Promise<TransactionItem[]> {
  const selectQuery = sql.select().from('Transaction').where({ toTenantId });
  const { rows } = await mysqlQuery<TransactionItem>(selectQuery);
  return rows;
}

export async function createTransaction(create: Transaction, session?: MysqlSession): Promise<number> {
  const insertQuery = sql.insert().into('Transaction').values([create]);
  const { insertId } = await mysqlQuery(insertQuery, session);
  return insertId;
}

export async function deleteTransactionById(id: number, session?: MysqlSession): Promise<boolean> {
  const deleteQuery = sql.delete('Transaction').where('id', id);
  const { affectedRows } = await mysqlQuery(deleteQuery, session);
  return affectedRows === 1;
}
