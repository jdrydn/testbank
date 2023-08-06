import assert from 'http-assert-plus';
import type { JsonApiRoot } from 'jsonapi-resolvers';

import { getAccountById } from '@/modules/accounts/model';
import { transformPrivateAccount } from '@/modules/accounts/resolver';
import { decodeAccountId } from '@/modules/hashes';

import { KoaContext, setRes } from '../context';

/**
 * GET /accounts/:accountId
 * Get an account by ID.
 */
export default async function getAccountRoute(ctx: KoaContext<JsonApiRoot>) {
  const { tenantId } = ctx.state;
  assert(tenantId, 401, 'Not authenticated');

  const errDetails = {
    title: 'Account not found',
    userMessage: 'This account by ID was not found.',
    code: 'ACCOUNT_NOT_FOUND',
    tenantId,
  };

  const { accountId: encodedAccountId } = ctx.params ?? {};
  assert(encodedAccountId, 404, 'Missing parameter { accountId }', errDetails);

  const accountId = decodeAccountId(encodedAccountId);

  const accountItem = await getAccountById(tenantId, accountId);
  assert(accountItem?.id, 404, 'Account not found by ID', {
    ...errDetails,
    accountId,
  });

  setRes(ctx, {
    data: transformPrivateAccount(accountItem),
  }, {
    date: true,
    etag: true,
    lastModified: accountItem.updatedAt,
  });
}
