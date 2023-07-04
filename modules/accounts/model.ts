import { mysqlQuery, sql, MysqlSession } from '@/lib/mysql';
import { CurrencyCode } from '@/modules/currencyCodes/static';

export interface Account {
  name: string,
  externalId?: string,
  // loanId?: string,
  currencyCode: CurrencyCode,
  balanceTotal: number,
  // cryptoFractional?: number,
}

export interface AccountItem extends Account {
  id: number,
  tenantId: number,
  createdAt: Date,
  updatedAt: Date,
  deletedAt?: Date,
}

export async function getAccountById(tenantId: number, id: number): Promise<AccountItem | undefined> {
  const selectQuery = sql.select().from('Account').where({ tenantId, id });
  return (await mysqlQuery<AccountItem>(selectQuery)).first();
}

export async function findAccounts(tenantId: number): Promise<AccountItem[]> {
  const selectQuery = sql.select().from('Account').where({ tenantId });
  const { rows } = await mysqlQuery<AccountItem>(selectQuery);
  return rows;
}

export async function createAccount(tenantId: number, create: Account, session?: MysqlSession): Promise<number> {
  const insertQuery = sql.insert().into('Account').values([{ tenantId, ...create }]);
  const { insertId } = await mysqlQuery(insertQuery, session);
  return insertId;
}

export async function updateAccountById(id: number, update: Partial<Account>, session?: MysqlSession): Promise<boolean> {
  const updateQuery = sql.update('Account').values(update).where('id', id);
  const { affectedRows } = await mysqlQuery(updateQuery, session);
  return affectedRows === 1;
}

export async function deleteAccountById(id: number, session?: MysqlSession): Promise<boolean> {
  const deleteQuery = sql.delete('Account').where('id', id);
  const { affectedRows } = await mysqlQuery(deleteQuery, session);
  return affectedRows === 1;
}
