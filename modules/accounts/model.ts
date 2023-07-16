import { mysqlQuery, sql, MysqlSession } from '@/lib/mysql';

export interface Account {
  name: string,
  externalId?: string | undefined,
  // loanId?: string | undefined,
  email?: string | undefined,
  phone?: string | undefined,
  currencyCode: string,
  balanceTotal: number,
  // balanceFractional?: number | undefined,
  visibility: keyof typeof AccountVisibility,
}

export interface AccountItem extends Account {
  id: number,
  tenantId: number,
  createdAt: Date,
  updatedAt: Date,
  deletedAt?: Date,
}

export const AccountVisibility = {
  0: 'PUBLIC',
  1: 'UNLISTED',
  2: 'PRIVATE',
};

export async function getAccountById(tenantId: number, id: number, { session }: {
  session?: MysqlSession | undefined,
} = {}): Promise<AccountItem | undefined> {
  const selectQuery = sql.select().from('Account').where({ tenantId, id });
  return (await mysqlQuery<AccountItem>(selectQuery, session)).first();
}

export async function findAccounts(tenantId: number, { columns, session }: {
  columns?: (keyof AccountItem)[],
  session?: MysqlSession | undefined,
} = {}): Promise<AccountItem[]> {
  const selectQuery = sql.select(Array.isArray(columns) && columns.length ? columns : [])
    .from('Account')
    .where({ tenantId });
  const { rows } = await mysqlQuery<AccountItem>(selectQuery, session);
  return rows;
}

export async function findAccountsById(ids: number[], { session }: {
  session?: MysqlSession | undefined,
} = {}): Promise<AccountItem[]> {
  const selectQuery = sql.select().from('Account').where(sql.in('id', ids));
  const { rows } = await mysqlQuery<AccountItem>(selectQuery, session);
  return rows;
}

export async function createAccount(tenantId: number, create: Account, { session }: {
  session?: MysqlSession | undefined,
} = {}): Promise<number> {
  const insertQuery = sql.insert().into('Account').values([{ tenantId, ...create }]);
  const { insertId } = await mysqlQuery(insertQuery, session);
  return insertId;
}

export async function updateAccountById(id: number, update: Partial<Account>, { session }: {
  session?: MysqlSession | undefined,
} = {}): Promise<boolean> {
  const updateQuery = sql.update('Account').values(update).where('id', id);
  const { affectedRows } = await mysqlQuery(updateQuery, session);
  return affectedRows === 1;
}

export async function deleteAccountById(id: number, { session }: {
  session?: MysqlSession | undefined,
} = {}): Promise<boolean> {
  const deleteQuery = sql.delete('Account').where('id', id);
  const { affectedRows } = await mysqlQuery(deleteQuery, session);
  return affectedRows === 1;
}
