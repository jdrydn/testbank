// import rewrite from 'supertest-rewrite-json-body';

import { API_AUTH_HEADER } from '@/test/config';

import request from '../test/request';

describe('services/rest-api', () => describe('routes/accounts.list', () => {
  it('should successfully list all accounts', async () => {
    await request.get('/accounts')
      .set('Authorization', API_AUTH_HEADER)
      .expect(200)
      // .expect(rewrite({
      //   'data.([0-9]+).id': rewrite.string().value(':accountId'),
      //   'data.([0-9]+).links.self': rewrite.string().startsWith('/accounts/').value('/accounts/:accountId'),
      //   'data.([0-9]+).links.transactions': rewrite.string()
      //     .startsWith('/transactions/?filter[account]')
      //     .value('/transactions/?filter[account]=:accountId'),
      //   'data.([0-9]+).meta.createdAt': rewrite.date().value(now),
      //   'data.([0-9]+).meta.updatedAt': rewrite.date().value(now),
      // }))
      .expect({
        meta: {
          limit: 20,
          page: 1,
          total: 2,
        },
        data: [
          {
            type: 'accounts',
            id: '0A',
            attributes: {
              name: 'jdrydn test account',
              visibility: 'PRIVATE',
            },
            relationships: {
              currency: { data: { type: 'currencies', id: 'USD' } },
            },
            links: {
              self: '/accounts/0A',
              transactions: '/transactions/?filter[account]=0A',
            },
            meta: {
              balanceTotal: '100.00',
              externalId: 'first-ever-testbank-account',
              createdAt: '2023-06-24T10:01:00.000Z',
              updatedAt: '2023-06-24T10:59:00.000Z',
            },
          },
          {
            type: 'accounts',
            id: 'eJ',
            attributes: {
              name: 'another test account',
              visibility: 'PRIVATE',
            },
            relationships: {
              currency: { data: { type: 'currencies', id: 'USD' } },
            },
            links: {
              self: '/accounts/eJ',
              transactions: '/transactions/?filter[account]=eJ',
            },
            meta: {
              balanceTotal: '999.99',
              createdAt: '2023-06-24T10:02:00.000Z',
              updatedAt: '2023-06-24T10:58:00.000Z',
            },
          },
        ],
      });
  });

  it('should successfully list all accounts with a custom sort', async () => {
    await request.get(`/accounts`)
      .query('sort=-createdAt')
      .set('Authorization', API_AUTH_HEADER)
      .expect(200)
      .expect({
        meta: {
          limit: 20,
          page: 1,
          total: 2,
        },
        data: [
          {
            type: 'accounts',
            id: 'eJ',
            attributes: {
              name: 'another test account',
              visibility: 'PRIVATE',
            },
            relationships: {
              currency: { data: { type: 'currencies', id: 'USD' } },
            },
            links: {
              self: '/accounts/eJ',
              transactions: '/transactions/?filter[account]=eJ',
            },
            meta: {
              balanceTotal: '999.99',
              createdAt: '2023-06-24T10:02:00.000Z',
              updatedAt: '2023-06-24T10:58:00.000Z',
            },
          },
          {
            type: 'accounts',
            id: '0A',
            attributes: {
              name: 'jdrydn test account',
              visibility: 'PRIVATE',
            },
            relationships: {
              currency: { data: { type: 'currencies', id: 'USD' } },
            },
            links: {
              self: '/accounts/0A',
              transactions: '/transactions/?filter[account]=0A',
            },
            meta: {
              balanceTotal: '100.00',
              externalId: 'first-ever-testbank-account',
              createdAt: '2023-06-24T10:01:00.000Z',
              updatedAt: '2023-06-24T10:59:00.000Z',
            },
          },
        ],
      });
  });

}));
