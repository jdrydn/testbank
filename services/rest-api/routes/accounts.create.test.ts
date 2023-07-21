import crypto from 'crypto';

import { mysqlQuery, sql } from '@/lib/mysql';
import { encodeAccountId } from '@/modules/hashes';
import { getNextInsertId } from '@/test/database';

import request from '../test/request';
import { API_AUTH_HEADER } from '../test/config';

describe('services/rest-api/routes/accounts.create', () => {
  const name = crypto.randomBytes(8).toString('hex');

  afterEach(async () => {
    const deleteQuery = sql.delete().from('Account').where('name = ?', name);
    await mysqlQuery(deleteQuery);
  });

  it('should successfully create a new account', async () => {
    const accountId = encodeAccountId(await getNextInsertId('Account'));

    await request.post('/accounts')
      .set('Authorization', API_AUTH_HEADER)
      .send({
        data: {
          type: 'accounts',
          attributes: {
            name,
          },
          relationships: {
            currency: {
              data: {
                type: 'currencies',
                id: 'USD',
              },
            },
          },
        },
      })
      .expect(201)
      .expect({
        data: {
          type: 'accounts',
          id: accountId,
          attributes: {
            name,
            visibility: 'PRIVATE',
          },
          relationships: {
            currency: {
              data: {
                type: 'currencies',
                id: 'USD',
              },
            },
          },
          links: {
            self: `/accounts/${accountId}`,
            transactions: `/transactions/?filter[account]=${accountId}`,
          },
          meta: {
            balanceTotal: '0.00',
          },
        },
      });
  });

});
