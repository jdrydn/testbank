import assert from 'http-assert-plus';
import type { JsonApiRoot } from 'jsonapi-resolvers';

import { decodeAccountId } from '@/modules/accounts/controller';
import { getAccountById } from '@/modules/accounts/model';
import { transformPrivateAccount } from '@/modules/accounts/resolver';
import type { KoaContext } from '../context';

export default async function getAccountEndpoint(ctx: KoaContext<JsonApiRoot>) {
  const { tenantId } = ctx.state;
  assert(tenantId, 401, 'Not authenticated');

  const errDetails = {
    title: 'Account not found',
    userMessage: 'This account by ID was not found.',
    code: 'ACCOUNT_NOT_FOUND',
  };

  const { accountId: encodedAccountId } = ctx.params ?? {};
  assert(encodedAccountId, 404, 'Missing parameter { accountId }', errDetails);

  const [tId2, accountId] = decodeAccountId(encodedAccountId);
  assert(tenantId === tId2, 404, 'Tenant ID mismatch', { ...errDetails, tenantId, tenantId2: tId2 });

  const account = await getAccountById(tenantId, accountId);
  assert(account?.id, 404, 'Account not found by ID', { ...errDetails, tenantId, accountId });

  const data = transformPrivateAccount(account);
  ctx.status = 200;
  ctx.body = { data };
}
