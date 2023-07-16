import assert from 'http-assert-plus';
import type { JsonApiRoot } from 'jsonapi-resolvers';

import { findAccounts } from '@/modules/accounts/model';
import { transformPrivateAccount } from '@/modules/accounts/resolver';
import type { KoaContext } from '../context';

export default async function listAccounts(ctx: KoaContext<JsonApiRoot>) {
  const { tenantId } = ctx.state;
  assert(tenantId, 401, 'Not authenticated');

  const accounts = await findAccounts(tenantId, { columns: ['id'] });

  ctx.status = 200;
  ctx.body = {
    data: accounts.map(account => transformPrivateAccount(account)),
  };
}
