import { createResolver as createJsonApiResolver } from 'jsonapi-resolvers';

import { JSONAPI_TYPE as accountsType, getAccountsById } from '@/modules/accounts/resolver';
import type { KoaContext } from './context';

export function createResolver(ctx: KoaContext) {
  return createJsonApiResolver({

    [accountsType]: ids => getAccountsById(ctx.state.tenantId ?? 0, ids, true),

  });
}
