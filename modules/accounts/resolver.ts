import type { JsonApiResource } from 'jsonapi-resolvers';

import { encodeAccountId, decodeAccountId } from '../hashes';
import { AccountItem, findAccountsById } from './model';

export const JSONAPI_TYPE = 'accounts';

export type PublicAccountJsonApiResource = JsonApiResource & {
  type: typeof JSONAPI_TYPE,
  id: string,
  attributes: {
    name: string,
  },
};

export type PrivateAccountJsonApiResource = JsonApiResource & {
  type: typeof JSONAPI_TYPE,
  id: string,
  attributes: {
    name: string,
    email?: string | undefined,
    phone?: string | undefined,
    visibility: 'PRIVATE' | 'UNLISTED' | 'PUBLIC',
  },
  relationships: {
    // tenant: { data: { type: 'tenants', id: string } } | undefined,
    currency: { data: { type: 'currencies', id: string } } | undefined,
    // loan: { data: { type: 'loans', id: string } } | undefined,
  },
  links: {
    self: string,
    transactions: string,
  },
  meta: {
    externalId?: string | undefined,
    balanceTotal: number,
    createdAt: string,
    updatedAt: string,
  },
};

/**
 * Resolve IDs into accounts, decoding any string IDs as appropriate.
 * If public data is allowed, transform any accounts for other tenants into "public" listings.
 */
export async function getAccountsById(currentTenantId: number, accountIds: (string | number)[], allowPublic = false):
Promise<(PublicAccountJsonApiResource | PrivateAccountJsonApiResource)[]> {
  const entryIds = accountIds.map(id => (typeof id === 'string' ? decodeAccountId(id) : id));
  return (await findAccountsById(entryIds)).reduce((list, entry) => {
    if (entry?.id && entry.tenantId === currentTenantId) {
      list.push(transformPrivateAccount(entry));
    } else if (entry?.id && allowPublic === true) {
      list.push(transformPublicAccount(entry));
    }

    return list;
  }, [] as Awaited<ReturnType<typeof getAccountsById>>);
}

/**
 * Transform a public account, severly limiting the amount of data returned.
 */
export function transformPublicAccount(entry: AccountItem): PublicAccountJsonApiResource {
  return {
    type: 'accounts',
    id: encodeAccountId(entry.id),
    attributes: {
      name: entry.name,
    },
  };
}

/**
 * Transform a private account, listing as many properties as possible.
 */
export function transformPrivateAccount(entry: AccountItem): PrivateAccountJsonApiResource {
  const id = encodeAccountId(entry.id);
  return {
    type: 'accounts',
    id,
    attributes: {
      name: entry.name,
      email: entry.email ?? undefined,
      phone: entry.phone ?? undefined,
      visibility: entry.visibility,
    },
    relationships: {
      // tenant: { data: { type: 'tenants', id: entry.tenantId } },
      currency: { data: { type: 'currencies', id: entry.currencyCode } },
    },
    links: {
      self: `/accounts/${id}`,
      transactions: `/transactions/?filter[account]=${id}`,
    },
    meta: {
      externalId: entry.externalId ?? undefined,
      balanceTotal: entry.balanceTotal,
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    },
  };
}
