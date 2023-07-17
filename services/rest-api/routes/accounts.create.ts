import assert from 'http-assert-plus';
import * as yup from 'yup';
import type { JsonApiRoot } from 'jsonapi-resolvers';

import { createAccount, AccountVisibility } from '@/modules/accounts/model';
// import { transformPrivateAccount } from '@/modules/accounts/resolver';
import type { KoaContext } from '../context';

export default async function createAccountEndpoint(ctx: KoaContext<JsonApiRoot>) {
  const { tenantId } = ctx.state;
  assert(tenantId, 401, 'Not authenticated');

  const { data } = ((s, t) => s.validateSync(ctx.request.body, t))(yup.object().required().shape({
    data: yup.object().required().shape({
      type: yup.string().required().oneOf(['accounts']),
      attributes: yup.object().required().shape({
        name: yup.string().required(),
        visibility: yup.string().required().oneOf(Object.keys(AccountVisibility)),
      }),
      relationships: yup.object().required().shape({
        currency: yup.object().required().shape({
          data: yup.object().required().shape({
            type: yup.string().required().oneOf(['currencies']),
            id: yup.string().required(),
          }),
        }),
        initialBalance: yup.object().default(undefined).shape({
          data: yup.object().required().shape({
            type: yup.string().required().oneOf(['transactions']),
            attributes: yup.object().required().shape({
              amount: yup.string().required(),
              reference: yup.string().required(),
            }),
          }),
        }),
      }),
      meta: yup.object({
        externalId: yup.string(),
      }),
    }),
  }), {
    abortEarly: false,
    stripUnknown: true,
  });

  const accountId = await createAccount(tenantId, {
    name: data.attributes.name,
    visibility: data.attributes.visibility as unknown as AccountVisibility,
    currencyCode: data.relationships.currency.data.id,
    balanceTotal: 0,
  });

  ctx.status = 200;
  ctx.body = {
    data: { ...data, id }
  };
}
