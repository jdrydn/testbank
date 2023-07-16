import type { JsonApiResource } from 'jsonapi-resolvers';

import { encodeAccountId, decodeAccountId } from './controller';
import { AccountItem, AccountVisibility, findAccountsById } from './model';

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
    visibility: typeof AccountVisibility[keyof typeof AccountVisibility],
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
    // balanceFractional?: number,
    createdAt: string,
    updatedAt: string,
  },
};

export async function getAccountsById(currentTenantId: number, accountIds: (string | number)[], allowPublic = false):
Promise<(PublicAccountJsonApiResource | PrivateAccountJsonApiResource)[]> {
  const entryIds = accountIds.map(id => typeof id === 'string' ? decodeAccountId(id)[1] : id);
  return (await findAccountsById(entryIds)).reduce((list, entry) => {
    if (entry?.id && entry.tenantId === currentTenantId) {
      list.push(transformPrivateAccount(entry));
    } else if (entry?.id && allowPublic === true) {
      list.push(transformPublicAccount(entry));
    }

    return list;
  }, [] as Awaited<ReturnType<typeof getAccountsById>>);
}

export function transformPublicAccount(entry: AccountItem): PublicAccountJsonApiResource {
  return {
    type: 'accounts',
    id: encodeAccountId(entry.tenantId, entry.id),
    attributes: {
      name: entry.name,
    },
  };
}

export function transformPrivateAccount(entry: AccountItem): PrivateAccountJsonApiResource {
  const id = encodeAccountId(entry.tenantId, entry.id);
  return {
    type: 'accounts',
    id,
    attributes: {
      name: entry.name,
      email: entry.email,
      phone: entry.phone,
      visibility: AccountVisibility[entry.visibility],
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
      externalId: entry.externalId,
      balanceTotal: entry.balanceTotal,
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    },
  };
}
