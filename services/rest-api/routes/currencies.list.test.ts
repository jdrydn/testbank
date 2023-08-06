import { API_AUTH_HEADER } from '@/test/config';

import request from '../test/request';

describe('services/rest-api', () => describe('routes/currencies.list', () => {
  it('should successfully list all currencies', async () => {
    await request.get('/currencies')
      .set('Authorization', API_AUTH_HEADER)
      .expect(200)
      .expect({
        meta: {
          total: 3,
        },
        data: [
          {
            type: 'currencies',
            id: 'USD',
            attributes: {
              name: 'United States Dollar',
              symbol: '$',
              icon: '🇺🇸',
            },
            links: {
              accounts: '/accounts/?filter[currencyCode]=USD',
            },
          },
          {
            type: 'currencies',
            id: 'GBP',
            attributes: {
              name: 'Great British Pound',
              symbol: '£',
              icon: '🇬🇧',
            },
            links: {
              accounts: '/accounts/?filter[currencyCode]=GBP',
            },
          },
          {
            type: 'currencies',
            id: 'EUR',
            attributes: {
              name: 'Euro',
              symbol: '€',
              icon: '🇪🇺',
            },
            links: {
              accounts: '/accounts/?filter[currencyCode]=EUR',
            },
          },
        ],
      });
  });
}));
