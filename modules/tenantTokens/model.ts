import { mysqlQuery, sql, MysqlSession } from '@/lib/mysql';

export interface TenantToken {
  token: string,
  name: string,
  description: string,
}

export interface TenantTokenItem extends TenantToken {
  id: number,
  tenantId: number,
  createdAt: Date,
  updatedAt: Date,
  lastSeenAt?: Date,
  expiresAt?: Date,
  deletedAt?: Date,
}

export async function getTenantTokenById(tenantId: number, id: number): Promise<TenantTokenItem | undefined> {
  const selectQuery = sql.select().from('TenantToken').where('tenantId = ? AND id = ?', tenantId, id);
  return (await mysqlQuery<TenantTokenItem>(selectQuery)).first();
}

export async function getTenantTokenByToken(token: string): Promise<TenantTokenItem | undefined> {
  const selectQuery = sql.select().from('TenantToken').where('token = ?', token);
  return (await mysqlQuery<TenantTokenItem>(selectQuery)).first();
}

export async function findTenantTokens(tenantId: number): Promise<TenantTokenItem[]> {
  const selectQuery = sql.select().from('TenantToken').where('tenantId = ?', tenantId);
  const { rows } = await mysqlQuery<TenantTokenItem>(selectQuery);
  return rows;
}

export async function createTenantToken(tenantId: number, create: TenantToken, session?: MysqlSession):
Promise<number> {
  const insertQuery = sql.insert().into('TenantToken').setFields([ { tenantId, ...create } ]);
  const { insertId } = await mysqlQuery(insertQuery, session);
  return insertId;
}

export async function updateTenantTokenById(id: number, update: Partial<TenantToken>, session?: MysqlSession):
Promise<boolean> {
  const updateQuery = sql.update().table('TenantToken').setFields(update).where('id = ?', id);
  const { affectedRows } = await mysqlQuery(updateQuery, session);
  return affectedRows === 1;
}

export async function deleteTenantTokenById(id: number, session?: MysqlSession): Promise<boolean> {
  const deleteQuery = sql.delete().from('TenantToken').where('id = ?', id);
  const { affectedRows } = await mysqlQuery(deleteQuery, session);
  return affectedRows === 1;
}
