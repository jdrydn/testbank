import type { JsonApiRoot } from 'jsonapi-resolvers';

import { currencies, CurrencyResource } from '@/modules/currencies/static';

import { KoaContext, setRes } from '../context';

/**
 * GET /currencies
 * List all currencies.
 */
export default function listCurrenciesRoute(ctx: KoaContext<JsonApiRoot>): void {
  const data = Object.entries(currencies).map(([ code, attributes ]): CurrencyResource => ({
    type: 'currencies',
    id: code,
    attributes,
    links: {
      accounts: `/accounts/?filter[currencyCode]=${code}`,
    },
  }));

  setRes(ctx, {
    meta: { total: data.length },
    data,
  }, {
    date: true,
    etag: true,
  });
}
