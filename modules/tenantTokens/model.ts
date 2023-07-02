import { mysqlQuery, sql } from '@/lib/mysql';

export interface TenantToken {
  tenantId: number,
  token: string,
  name: string,
  description: string,
}

export interface TenantTokenItem extends TenantToken {
  id: number,
  createdAt: Date,
  updatedAt: Date,
  lastSeenAt?: Date,
  expiresAt?: Date,
  deletedAt?: Date,
}

export async function getTenantTokenById(tokenId: number): Promise<TenantTokenItem | undefined> {
  const selectQuery = sql.select().from('TenantToken').where('id', tokenId);
  return (await mysqlQuery<TenantTokenItem>(selectQuery)).first();
}

export async function getTenantTokenByToken(token: string): Promise<TenantTokenItem | undefined> {
  const selectQuery = sql.select().from('TenantToken').where('token', token);
  return (await mysqlQuery<TenantTokenItem>(selectQuery)).first();
}
