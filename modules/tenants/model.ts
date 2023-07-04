import { mysqlQuery, sql, MysqlSession } from '@/lib/mysql';

export interface Tenant {
  name: string,
  email: string,
}

export interface TenantItem extends Tenant {
  id: number,
  createdAt: Date,
  updatedAt: Date,
  deletedAt?: Date,
}

export async function getTenantById(tenantId: number): Promise<TenantItem | undefined> {
  const selectQuery = sql.select().from('Tenant').where('id', tenantId);
  return (await mysqlQuery<TenantItem>(selectQuery)).first();
}

export async function findTenants(): Promise<TenantItem[]> {
  const selectQuery = sql.select().from('Tenant');
  const { rows } = await mysqlQuery<TenantItem>(selectQuery);
  return rows;
}

export async function createTenant(create: Tenant, session?: MysqlSession): Promise<number> {
  const insertQuery = sql.insert().into('Tenant').values([create]);
  const { insertId } = await mysqlQuery(insertQuery, session);
  return insertId;
}

export async function updateTenantById(id: number, update: Partial<Tenant>, session?: MysqlSession): Promise<boolean> {
  const updateQuery = sql.update('Tenant').values(update).where('id', id);
  const { affectedRows } = await mysqlQuery(updateQuery, session);
  return affectedRows === 1;
}

export async function deleteTenantById(id: number, session?: MysqlSession): Promise<boolean> {
  const deleteQuery = sql.delete('Tenant').where('id', id);
  const { affectedRows } = await mysqlQuery(deleteQuery, session);
  return affectedRows === 1;
}
