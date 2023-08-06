import assert from 'http-assert-plus';
import type { JsonApiRoot } from 'jsonapi-resolvers';

import { getMysqlTransaction } from '@/lib/mysql';
import { getAccountById, updateAccountById } from '@/modules/accounts/model';
import { transformPrivateAccount } from '@/modules/accounts/resolver';
import { decodeAccountId } from '@/modules/hashes';
import { validate, yup } from '@/lib/validate';

import { KoaContext, setRes } from '../context';

/**
 * PATCH /accounts/:accountId
 * Update an account by ID
 */
export default async function updateAccountRoute(ctx: KoaContext<JsonApiRoot>) {
  const { tenantId } = ctx.state;
  assert(tenantId, 401, 'Not authenticated');

  const { accountId: encodedAccountId } = ctx.params ?? {};
  assert(encodedAccountId, 500, 'Missing route param { accountId }');

  const accountId = decodeAccountId(encodedAccountId);

  const accountItem = await getMysqlTransaction(async session => {
    const before = await getAccountById(tenantId, accountId, { session });
    assert(before?.id, 404, 'Account not found by ID', {
      title: 'Account not found',
      userMessage: 'This account by ID was not found.',
      code: 'ACCOUNT_NOT_FOUND',
      tenantId,
      accountId,
    });

    const { data } = validate(ctx.request.body, yup.object().required().shape({
      data: yup.object().required().shape({
        type: yup.string().required().oneOf([ 'accounts' ]),
        attributes: yup.object().shape({
          name: yup.string().nonNullable(),
          visibility: yup.string<'PRIVATE' | 'UNLISTED' | 'PUBLIC'>().oneOf([ 'PRIVATE', 'UNLISTED', 'PUBLIC' ])
            .nonNullable(),
        }),
        meta: yup.object({
          externalId: yup.string().nonNullable(),
        }),
      }),
    }));

    const updated = await updateAccountById(tenantId, before.id, {
      ...(data.attributes.name && { name: data.attributes.name }),
      ...(data.attributes.visibility && { visibility: data.attributes.visibility }),
      ...(data.meta.externalId && { externalId: data.meta.externalId }),
    }, { session });
    assert(updated, 500, 'Failed to update account');
    return getAccountById(tenantId, before.id, { session });
  });
  assert(accountItem?.id, 500, 'Failed to create account');

  setRes(ctx, {
    data: transformPrivateAccount(accountItem),
  }, {
    date: true,
    etag: true,
    lastModified: accountItem.updatedAt,
  });
}
