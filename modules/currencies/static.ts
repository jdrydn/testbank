export interface Currency {
  name: string,
  symbol: string,
  icon: string,
}

export const currencies: Record<string, Currency> = {
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
