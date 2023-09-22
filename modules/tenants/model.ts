import { mysqlQuery, sql, MysqlSession } from '@/lib/mysql';
import { yup, CreateSchema, UpdateSchema } from '@/lib/validate';

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

const createSchema: CreateSchema<Tenant> = yup.object({
  name: yup.string().required(),
  email: yup.string().required(),
});
const updateSchema: UpdateSchema<Tenant> = yup.object({
  name: yup.string().optional().nonNullable(),
  email: yup.string().optional().nonNullable(),
});

/**
 * Get tenant by ID
 */
export async function getTenantById(tenantId: number, { session }: {
  session?: MysqlSession | undefined,
} = {}): Promise<TenantItem | undefined> {
  const selectQuery = sql.select().from('Tenant').where('id = ?', tenantId);
  return (await mysqlQuery<TenantItem>(selectQuery, session)).first();
}

/**
 * Find tenants by specific ID
 */
export async function findTenantsById(tenantIds: number[], { session }: {
  session?: MysqlSession | undefined,
} = {}): Promise<TenantItem[]> {
  const selectQuery = sql.select().from('Tenant').where('id IN ?', tenantIds);
  const { rows } = await mysqlQuery<TenantItem>(selectQuery, session);
  return rows;
}

/**
 * Create a tenant
 */
export async function createTenant(create: Tenant, { session }: {
  session?: MysqlSession | undefined,
} = {}): Promise<number> {
  const insertQuery = sql.insert().into('Tenant').setFields(create);
  const { insertId } = await mysqlQuery(insertQuery, session);
  return insertId;
}

/**
 * Update tenant by ID
 */
export async function updateTenantById(tenantId: number, update: Partial<Tenant>, { session }: {
  session?: MysqlSession | undefined,
} = {}): Promise<boolean> {
  const updateQuery = sql.update().table('Tenant').setFields(update).where('id = ?', tenantId);
  const { affectedRows } = await mysqlQuery(updateQuery, session);
  return affectedRows === 1;
}

/**
 * Delete tenant by ID
 */
export async function deleteTenantById(tenantId: number, { session }: {
  session?: MysqlSession | undefined,
} = {}): Promise<boolean> {
  const deleteQuery = sql.delete().from('Tenant').where('id = ?', tenantId);
  const { affectedRows } = await mysqlQuery(deleteQuery, session);
  return affectedRows === 1;
}
