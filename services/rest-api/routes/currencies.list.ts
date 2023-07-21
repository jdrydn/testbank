import type { JsonApiRoot } from 'jsonapi-resolvers';

import { currencies, CurrencyResource } from '@/modules/currencies/static';

import { KoaContext, setRes } from '../context';

export default function listCurrenciesRoute(ctx: KoaContext<JsonApiRoot>): void {
  setRes(ctx, {
    data: Object.entries(currencies).map(([ code, attributes ]): CurrencyResource => ({
      type: 'currencies',
      id: code,
      attributes,
    })),
  }, {
    date: true,
    etag: true,
  });
}
