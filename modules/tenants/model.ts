import { createMongoClient, createObjectId, mongoSession } from '@/lib/mongodb';
import type { WithId } from 'mongodb';

export interface Tenant {
  name: string,
  email: string,
}

export interface TenantDocument extends Tenant {
  _id: string,
  createdAt: Date,
  updatedAt: Date,
  deletedAt?: Date,
}

/**
 * Shorthand to create the Tenant collection reference.
 */
function getTenantCollection() {
  return createMongoClient().db().collection<Omit<TenantDocument, '_id'>>('tenants');
}

/**
 * Format the entry on read
 */
function formatReadEntry(entry: WithId<Omit<TenantDocument, '_id'>>): TenantDocument {
  return {
    ...entry,
    _id: entry._id.toString(),
  };
}

/**
 * Get tenant by ID
 */
export async function getTenantById(tenantId: string, { session }: {
  session?: mongoSession | undefined,
} = {}): Promise<TenantDocument | undefined> {
  const entry = await getTenantCollection().findOne({
    _id: createObjectId(tenantId),
  }, {
    comment: 'tenants.getTenantById',
    ...(session ? { session } : undefined),
  });
  return entry?._id ? formatReadEntry(entry) : undefined;
}

/**
 * Find tenants by specific ID
 */
export async function findTenantsById(tenantIds: string[], { session }: {
  session?: mongoSession | undefined,
} = {}): Promise<TenantDocument[]> {
  const cursor = getTenantCollection().find({
    $or: tenantIds.map(id => ({ _id: createObjectId(id) })),
  }, {
    comment: 'tenants.findTenantsById',
    ...(session ? { session } : undefined),
  });
  return (await cursor.toArray()).map(entry => formatReadEntry(entry));
}

/**
 * Create a tenant
 */
export async function createTenant(create: Tenant, { session }: {
  session?: mongoSession | undefined,
} = {}): Promise<string> {
  const result = await getTenantCollection().insertOne({
    ...create,
    createdAt: new Date(),
    updatedAt: new Date(),
  }, {
    comment: 'tenants.createTenant',
    ...(session ? { session } : undefined),
  });

  return result.insertedId.toString();
}

/**
 * Update tenant by ID
 */
export async function updateTenantById(tenantId: string, update: Partial<Tenant>, { session }: {
  session?: mongoSession | undefined,
} = {}): Promise<boolean> {
  const result = await getTenantCollection().updateOne({
    _id: createObjectId(tenantId),
  }, {
    ...update,
    updatedAt: new Date(),
  }, {
    comment: 'tenants.updateTenantById',
    ...(session ? { session } : undefined),
  });

  return result.matchedCount === 1;
}

/**
 * Delete tenant by ID
 */
export async function deleteTenantById(tenantId: string, { session }: {
  session?: mongoSession | undefined,
} = {}): Promise<boolean> {
  const result = await getTenantCollection().deleteOne({
    _id: createObjectId(tenantId),
  }, {
    comment: 'tenants.deleteTenantById',
    ...(session ? { session } : undefined),
  });

  return result.deletedCount === 1;
}
