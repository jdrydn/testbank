import { mysqlQuery, sql } from '@/lib/mysql';

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
