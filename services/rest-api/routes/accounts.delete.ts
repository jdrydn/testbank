import assert from 'http-assert-plus';
import type { JsonApiRoot } from 'jsonapi-resolvers';

import { getMysqlTransaction } from '@/lib/mysql';
import { getAccountById, deleteAccountById } from '@/modules/accounts/model';
import { decodeAccountId } from '@/modules/hashes';

import type { KoaContext } from '../context';

/**
 * DELETE /accounts/:accountId
 * Delete an account by ID
 */
export default async function deleteAccountRoute(ctx: KoaContext<JsonApiRoot>) {
  const { tenantId } = ctx.state;
  assert(tenantId, 401, 'Not authenticated');

  const { accountId: encodedAccountId } = ctx.params ?? {};
  assert(encodedAccountId, 500, 'Missing route param { accountId }');

  const accountId = decodeAccountId(encodedAccountId);

  await getMysqlTransaction(async session => {
    const before = await getAccountById(tenantId, accountId, { session });
    assert(before?.id, 404, 'Account not found by ID', {
      title: 'Account not found',
      userMessage: 'This account by ID was not found.',
      code: 'ACCOUNT_NOT_FOUND',
      tenantId,
      accountId,
    });

    const deleted = await deleteAccountById(tenantId, before.id, { session });
    assert(deleted, 500, 'Failed to update account');
  });

  ctx.status = 204;
}
