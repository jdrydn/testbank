import assert from 'http-assert-plus';
import type { JsonApiRoot } from 'jsonapi-resolvers';

import { getAccountById } from '@/modules/accounts/model';
import { transformPrivateAccount } from '@/modules/accounts/resolver';

import { KoaContext, setRes } from '../context';

export default async function getAccountRoute(ctx: KoaContext<JsonApiRoot>) {
  const { tenantId } = ctx.state;
  assert(tenantId, 401, 'Not authenticated');

  const errDetails = {
    title: 'Account not found',
    userMessage: 'This account by ID was not found.',
    code: 'ACCOUNT_NOT_FOUND',
  };

  const { accountId: encodedAccountId } = ctx.params ?? {};
  assert(encodedAccountId, 404, 'Missing parameter { accountId }', errDetails);

  const accountItem = await getAccountById(tenantId, encodedAccountId);
  assert(accountItem?.id, 404, 'Account not found by ID', {
    title: 'Account not found',
    userMessage: 'This account by ID was not found.',
    code: 'ACCOUNT_NOT_FOUND',
    tenantId,
    accountId: encodedAccountId,
  });

  setRes(ctx, {
    data: transformPrivateAccount(accountItem),
  }, {
    date: true,
    etag: true,
    lastModified: accountItem.updatedAt,
  });
}
