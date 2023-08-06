import { mysqlQuery, sql } from '@/lib/mysql';
import { encodeAccountId } from '@/modules/hashes';
import { API_AUTH_HEADER, API_TENANT_ID } from '@/test/config';
import { useTestState } from '@/test/hooks';

import request from '../test/request';

describe('services/rest-api', () => describe('routes/accounts.delete', () => {
  const accountId = useTestState(async () => {
    const { insertId } = await mysqlQuery(sql.insert().into('Account').setFields({
      tenantId: API_TENANT_ID,
      externalId: 'services/rest-api/routes/accounts.delete',
      name: 'An account to be deleted',
      currencyCode: 'USD',
      balanceTotal: 0,
      visibility: 'PRIVATE',
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

  it('should successfully delete a new account', async () => {
    const encodedId = accountId.encodedId();

    await request.delete(`/accounts/${encodedId}`)
      .set('Authorization', API_AUTH_HEADER)
      .expect(204);
  });

  it('should fail to delete an account that does not belong to the current tenant', async () => {
    const encodedId = encodeAccountId(3);

    await request.delete(`/accounts/${encodedId}`)
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

  it('should fail to delete an account that does not exist', async () => {
    const encodedId = encodeAccountId(1024);

    await request.delete(`/accounts/${encodedId}`)
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
