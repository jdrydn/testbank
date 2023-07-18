import { mysqlQuery, sql, MysqlSession } from '@/lib/mysql';

import { decodeAccountId } from './controller';

export interface Account {
  name: string,
  externalId?: string | undefined,
  // loanId?: string | undefined,
  email?: string | undefined,
  phone?: string | undefined,
  currencyCode: string,
  balanceTotal: number,
  // balanceFractional?: number | undefined,
  visibility: 'PRIVATE' | 'UNLISTED' | 'PUBLIC',
}

export interface AccountItem extends Account {
  id: number,
  tenantId: number,
  createdAt: Date,
  updatedAt: Date,
  deletedAt?: Date,
}

export async function getAccountById(tenantId: number, id: string | number, { session }: {
  session?: MysqlSession | undefined,
} = {}): Promise<AccountItem | undefined> {
  const selectQuery = sql.select().from('Account').where('tenantId = ? AND id = ?', tenantId, id);

  if (typeof id === 'string') {
    const [tId2, aId] = decodeAccountId(id);
    if (tenantId !== tId2) {
      // Return `undefined` early if the tenant ID is mismatch
      return undefined;
    }
    selectQuery.where('tenantId = ? AND id = ?', tenantId, aId);
  } else {
    selectQuery.where('tenantId = ? AND id = ?', tenantId, id);
  }

  return (await mysqlQuery<AccountItem>(selectQuery, session)).first();
}

export async function findAccounts(tenantId: number, { session }: {
  session?: MysqlSession | undefined,
} = {}): Promise<AccountItem[]> {
  const selectQuery = sql.select().from('Account').where('tenantId = ?', tenantId);
  const { rows } = await mysqlQuery<AccountItem>(selectQuery, session);
  return rows;
}

export async function findAccountsById(ids: number[], { session }: {
  session?: MysqlSession | undefined,
} = {}): Promise<AccountItem[]> {
  const selectQuery = sql.select().from('Account').where('id IN ?', ids);
  const { rows } = await mysqlQuery<AccountItem>(selectQuery, session);
  return rows;
}

export async function createAccount(tenantId: number, create: Account, { session }: {
  session?: MysqlSession | undefined,
} = {}): Promise<number> {
  const insertQuery = sql.insert().into('Account').setFields({ tenantId, ...create });
  const { insertId } = await mysqlQuery(insertQuery, session);
  return insertId;
}

export async function updateAccountById(tenantId: number, id: number, update: Partial<Account>, { session }: {
  session?: MysqlSession | undefined,
} = {}): Promise<boolean> {
  const updateQuery = sql.update().table('Account').setFields(update).where('tenantId = ? AND id = ?', tenantId, id);
  const { affectedRows } = await mysqlQuery(updateQuery, session);
  return affectedRows === 1;
}

export async function deleteAccountById(tenantId: number, id: number, { session }: {
  session?: MysqlSession | undefined,
} = {}): Promise<boolean> {
  const deleteQuery = sql.delete().from('Account').where('tenantId = ? AND id = ?', tenantId, id);
  const { affectedRows } = await mysqlQuery(deleteQuery, session);
  return affectedRows === 1;
}
