import crypto from 'crypto';
import ms from 'ms';
import rewrite from 'supertest-rewrite-json-body';

import { mysqlQuery, sql } from '@/lib/mysql';
import { encodeAccountId } from '@/modules/hashes';
import { API_AUTH_HEADER } from '@/test/config';
import { getNextInsertId } from '@/test/database';

import request from '../test/request';

describe('services/rest-api', () => describe('routes/accounts.create', () => {
  const name = crypto.randomBytes(8).toString('hex');

  afterEach(async () => {
    const deleteQuery = sql.delete().from('Account').where('name = ?', name);
    await mysqlQuery(deleteQuery);
  });

  it('should successfully create a new account', async () => {
    const accountId = encodeAccountId(await getNextInsertId('Account'));
    const now = new Date();

    await request.post('/accounts')
      .set('Authorization', API_AUTH_HEADER)
      .send({
        data: {
          type: 'accounts',
          attributes: {
            name,
          },
          relationships: {
            currency: { data: { type: 'currencies', id: 'USD' } },
          },
        },
      })
      .expect(201)
      .expect(rewrite({
        'data.meta.createdAt': rewrite.date().within(ms('1s')).value(now),
        'data.meta.updatedAt': rewrite.date().within(ms('1s')).value(now),
      }))
      .expect({
        data: {
          type: 'accounts',
          id: accountId,
          attributes: {
            name,
            visibility: 'PRIVATE',
          },
          relationships: {
            currency: { data: { type: 'currencies', id: 'USD' } },
          },
          links: {
            self: `/accounts/${accountId}`,
            transactions: `/transactions/?filter[account]=${accountId}`,
          },
          meta: {
            balanceTotal: '0.00',
            createdAt: now,
            updatedAt: now,
          },
        },
      });
  });

}));
