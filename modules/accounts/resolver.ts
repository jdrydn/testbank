import type { JsonApiResource } from 'jsonapi-resolvers';

import { CurrencyCode } from '@/modules/currencyCodes/static';

import { encodeAccountId, decodeAccountId } from './controller';
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
    currencyCode: CurrencyCode,
    balanceTotal: number,
    // cryptoFractional?: number,
  },
  meta: {
    externalId?: string | undefined,
    createdAt: string,
    updatedAt: string,
  },
  links: {
    self: string,
  },
  // relationships: {
  //   tenant: { data: { type: 'tenants', id: string } } | undefined,
  //   // loan: { data: { type: 'loans', id: string } } | undefined,
  // },
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
      currencyCode: entry.currencyCode,
      balanceTotal: entry.balanceTotal,
    },
    meta: {
      externalId: entry.externalId,
      createdAt: entry.createdAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
    },
    links: {
      self: `/accounts/${id}`,
      transactions: `/accounts/${id}/transactions`,
    },
  };
}
