import ms from 'ms';
import rewrite from 'supertest-rewrite-json-body';

import { mysqlQuery, sql } from '@/lib/mysql';
import { encodeAccountId } from '@/modules/hashes';
import { API_AUTH_HEADER, API_TENANT_ID } from '@/test/config';
import { useTestState } from '@/test/hooks';

import request from '../test/request';

describe('services/rest-api', () => describe('routes/accounts.get', () => {
  const accountId = useTestState(async () => {
    const { insertId } = await mysqlQuery(sql.insert().into('Account').setFields({
      tenantId: API_TENANT_ID,
      name: 'Some account name',
      currencyCode: 'USD',
      balanceTotal: 0,
      visibility: 'PUBLIC',
    }));
    return insertId;
  }, async (id) => {
    if (id) {
      const deleteQuery = sql.delete().from('Account').where('id = ?', id);
      await mysqlQuery(deleteQuery);
    }
  }, {
    encodedId() {
      return encodeAccountId(this.value()!);
    },
  });

  it('should successfully get an account by ID', async () => {
    const encodedId = accountId.encodedId();
    const now = new Date();

    await request.get(`/accounts/${encodedId}`)
      .set('Authorization', API_AUTH_HEADER)
      .expect(200)
      .expect(rewrite({
        'data.meta.createdAt': rewrite.date().within(ms('1s')).value(now),
        'data.meta.updatedAt': rewrite.date().within(ms('1s')).value(now),
      }))
      .expect({
        data: {
          type: 'accounts',
          id: encodedId,
          attributes: {
            name: 'Some account name',
            visibility: 'PUBLIC',
          },
          relationships: {
            currency: { data: { type: 'currencies', id: 'USD' } },
          },
          links: {
            self: `/accounts/${encodedId}`,
            transactions: `/transactions/?filter[account]=${encodedId}`,
          },
          meta: {
            balanceTotal: '0.00',
            createdAt: now,
            updatedAt: now,
          },
        },
      });
  });

  it('should fail to get an account by ID if it\'s not ours', async () => {
    const encodedId = encodeAccountId(3);

    await request.get(`/accounts/${encodedId}`)
      .set('Authorization', API_AUTH_HEADER)
      .expect(404)
      .expect({
        errors: [
          {
            title: 'Account not found',
            detail: 'This account by ID was not found.',
            code: 'ACCOUNT_NOT_FOUND',
            status: 404,
          },
        ],
      });
  });

}));
