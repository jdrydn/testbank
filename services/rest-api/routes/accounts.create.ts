import assert from 'http-assert-plus';
import type { JsonApiRoot } from 'jsonapi-resolvers';

import { getMysqlTransaction } from '@/lib/mysql';
import { createAccount, getAccountById } from '@/modules/accounts/model';
import { transformPrivateAccount } from '@/modules/accounts/resolver';
import { validate, yup } from '@/lib/validate';
// import { transformPrivateAccount } from '@/modules/accounts/resolver';

import { KoaContext, setRes } from '../context';

export default async function createAccountEndpoint(ctx: KoaContext<JsonApiRoot>) {
  const { tenantId } = ctx.state;
  assert(tenantId, 401, 'Not authenticated');

  const { data } = validate(ctx.request.body, yup.object().required().shape({
    data: yup.object().required().shape({
      type: yup.string().required().oneOf(['accounts']),
      attributes: yup.object().required().shape({
        name: yup.string().required(),
        visibility: yup.string<'PRIVATE' | 'UNLISTED' | 'PUBLIC'>().required().oneOf(['PRIVATE', 'UNLISTED', 'PUBLIC']),
      }),
      relationships: yup.object().required().shape({
        currency: yup.object().required().shape({
          data: yup.object().required().shape({
            type: yup.string().required().oneOf(['currencies']),
            id: yup.string().required(),
          }),
        }),
        // initialBalance: yup.object().default(undefined).shape({
        //   data: yup.object().required().shape({
        //     type: yup.string().required().oneOf(['transactions']),
        //     attributes: yup.object().required().shape({
        //       amount: yup.string().required(),
        //       reference: yup.string().required(),
        //     }),
        //   }),
        // }),
      }),
      meta: yup.object({
        externalId: yup.string(),
      }),
    }),
  }));

  const accountItem = await getMysqlTransaction(async session => {
    const accountId = await createAccount(tenantId, {
      name: data.attributes.name,
      visibility: data.attributes.visibility,
      currencyCode: data.relationships.currency.data.id,
      balanceTotal: 0,
      externalId: data.meta.externalId,
    }, { session });

    return accountId ? await getAccountById(tenantId, accountId, { session }) : undefined;
  });
  assert(accountItem?.id, 500, 'Failed to create account');

  setRes(ctx, {
    data: transformPrivateAccount(accountItem),
  }, {
    status: 201,
    date: true,
    etag: true,
    lastModified: accountItem.updatedAt,
  });
}
