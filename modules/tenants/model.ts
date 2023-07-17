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

export async function getTenantById(tenantId: number, { session }: {
  session?: MysqlSession | undefined,
} = {}): Promise<TenantItem | undefined> {
  const selectQuery = sql.select().from('Tenant').where('id = ?', tenantId);
  return (await mysqlQuery<TenantItem>(selectQuery, session)).first();
}

export async function findTenantsById(tenantIds: number[], { session }: {
  session?: MysqlSession | undefined,
} = {}): Promise<TenantItem[]> {
  const selectQuery = sql.select().from('Tenant').where('id IN ?', tenantIds);
  const { rows } = await mysqlQuery<TenantItem>(selectQuery, session);
  return rows;
}

export async function createTenant(create: Tenant, { session }: {
  session?: MysqlSession | undefined,
} = {}): Promise<number> {
  const insertQuery = sql.insert().into('Tenant').setFields(create);
  const { insertId } = await mysqlQuery(insertQuery, session);
  return insertId;
}

export async function updateTenantById(tenantId: number, update: Partial<Tenant>, { session }: {
  session?: MysqlSession | undefined,
} = {}): Promise<boolean> {
  const updateQuery = sql.update().table('Tenant').setFields(update).where('id = ?', tenantId);
  const { affectedRows } = await mysqlQuery(updateQuery, session);
  return affectedRows === 1;
}

export async function deleteTenantById(tenantId: number, { session }: {
  session?: MysqlSession | undefined,
} = {}): Promise<boolean> {
  const deleteQuery = sql.delete().from('Tenant').where('id = ?', tenantId);
  const { affectedRows } = await mysqlQuery(deleteQuery, session);
  return affectedRows === 1;
}
