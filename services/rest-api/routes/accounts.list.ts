import assert from 'http-assert-plus';
import type { JsonApiRoot } from 'jsonapi-resolvers';

import { mysqlQuery, sql } from '@/lib/mysql';
import { validate, yup } from '@/lib/validate';
import { findAccountsById } from '@/modules/accounts/model';
import { transformPrivateAccount } from '@/modules/accounts/resolver';

import { KoaContext, setRes } from '../context';

export default async function listAccountsRoute(ctx: KoaContext<JsonApiRoot>) {
  const { tenantId } = ctx.state;
  assert(tenantId, 401, 'Not authenticated');

  const { filter, page } = validate(ctx.query, yup.object().required().shape({
    filter: yup.object({
      name: yup.string(),
      visibility: yup.string(),
      currency: yup.string(),
      externalId: yup.string(),
    }),
    page: yup.object({
      count: yup.number().default(1).min(1),
      limit: yup.number().default(20).min(0).max(100),
    }),
  }));

  const selectQuery = sql.select().field('id').from('Account').where('tenantId = ?', tenantId);

  if (filter.name) {
    selectQuery.where('LOWER(name) LIKE LOWER(?)', `%${filter.name}%`);
  }
  if (filter.visibility) {
    selectQuery.where('visibility = ?', filter.visibility);
  }
  if (filter.currency) {
    selectQuery.where('currencyCode = ?', filter.currency);
  }
  if (filter.externalId) {
    selectQuery.where('externalId = ?', filter.externalId);
  }

  selectQuery.offset(page.count > 1 ? ((page.count - 1) * page.limit) : 0);
  selectQuery.limit(page.limit);

  const accountIds = (await mysqlQuery(selectQuery)).column<number>();
  const data = (await findAccountsById(accountIds)).map(account => transformPrivateAccount(account));

  setRes(ctx, {
    data,
  }, {
    date: true,
    etag: true,
  });
}
