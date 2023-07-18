import type { JsonApiResource } from 'jsonapi-resolvers';

export interface CurrencyResource extends JsonApiResource {
  type: 'currencies',
  id: string,
  attributes: {
    name: string,
    symbol: string,
    icon: string,
  },
}

export const currencies: Record<string, CurrencyResource['attributes']> = {
  'USD': {
    name: 'United States Dollar',
    symbol: '$',
    icon: '🇺🇸',
  },
  'GBP': {
    name: 'Great British Pound',
    symbol: '£',
    icon: '🇬🇧',
  },
  'EUR': {
    name: 'Euro',
    symbol: '€',
    icon: '🇪🇺',
  },
};
