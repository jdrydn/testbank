import assert from 'http-assert-plus';
import type { JsonApiRoot } from 'jsonapi-resolvers';

import { mysqlQuery, sql } from '@/lib/mysql';
import { validate, yup } from '@/lib/validate';
import { findAccountsById } from '@/modules/accounts/model';
import { transformPrivateAccount } from '@/modules/accounts/resolver';

import { KoaContext, setRes } from '../context';

/**
 * GET /accounts
 * List all accounts owned by this tenant.
 */
export default async function listAccountsRoute(ctx: KoaContext<JsonApiRoot>) {
  const { tenantId } = ctx.state;
  assert(tenantId, 401, 'Not authenticated');

  const { filter, page, sort } = validate(ctx.query, yup.object().required().shape({
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
    sort: yup.string(),
  }));

  const selectQuery = sql.selectFoundRows()
    .from('Account')
    .field('id')
    .where('tenantId = ?', tenantId);

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

  if (sort) {
    sort.split(',').map(s => s.trim()).forEach(order => {
      const asc = order.substring(0, 1) !== '-';
      switch (asc ? order : order.substring(1)) {
        case 'createdAt': selectQuery.order('createdAt', asc); break;
        case 'updatedAt': selectQuery.order('updatedAt', asc); break;
      }
    });
  } else {
    selectQuery.order('id', true);
  }

  selectQuery.offset(page.count > 1 ? ((page.count - 1) * page.limit) : 0);
  selectQuery.limit(page.limit);

  const accountResults = await mysqlQuery(selectQuery);
  const data = (await findAccountsById(accountResults.column<number>()))
    .map(account => transformPrivateAccount(account));

  setRes(ctx, {
    meta: {
      total: accountResults.foundRows ?? 0,
      page: page.count,
      limit: page.limit,
    },
    data,
  }, {
    date: true,
    etag: true,
  });
}
