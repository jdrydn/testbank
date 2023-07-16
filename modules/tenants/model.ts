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
}): Promise<TenantItem | undefined> {
  const selectQuery = sql.select().from('Tenant').where('id', tenantId);
  return (await mysqlQuery<TenantItem>(selectQuery, session)).first();
}

export async function findTenants({ columns, session }: {
  columns?: string[] | undefined,
  session?: MysqlSession | undefined,
}): Promise<TenantItem[]> {
  const selectQuery = sql.select(Array.isArray(columns) && columns.length ? columns : [])
    .from('Tenant');
  const { rows } = await mysqlQuery<TenantItem>(selectQuery, session);
  return rows;
}

export async function createTenant(create: Tenant, { session }: {
  session?: MysqlSession | undefined,
}): Promise<number> {
  const insertQuery = sql.insert().into('Tenant').values([create]);
  const { insertId } = await mysqlQuery(insertQuery, session);
  return insertId;
}

export async function updateTenantById(id: number, update: Partial<Tenant>, { session }: {
  session?: MysqlSession | undefined,
}): Promise<boolean> {
  const updateQuery = sql.update('Tenant').values(update).where('id', id);
  const { affectedRows } = await mysqlQuery(updateQuery, session);
  return affectedRows === 1;
}

export async function deleteTenantById(id: number, { session }: {
  session?: MysqlSession | undefined,
}): Promise<boolean> {
  const deleteQuery = sql.delete('Tenant').where('id', id);
  const { affectedRows } = await mysqlQuery(deleteQuery, session);
  return affectedRows === 1;
}
