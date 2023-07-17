import type { JsonApiRoot, JsonApiResource } from 'jsonapi-resolvers';

import { currencies, Currency } from '@/modules/currencies/static';
import type { KoaContext } from '../context';

interface CurrencyResource extends JsonApiResource {
  type: 'currencies',
  id: string,
  attributes: {
    name: Currency['name'],
    symbol: Currency['symbol'],
    icon: Currency['icon'],
  },
}

export default function listCurrenciesEndpoint(ctx: KoaContext<JsonApiRoot>): void {
  ctx.status = 200;
  ctx.body = {
    data: Object.entries(currencies).map(([code, attributes]): CurrencyResource => ({
      type: 'currencies',
      id: code,
      attributes,
    })),
  };
};
