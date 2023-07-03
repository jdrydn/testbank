import assert from 'assert';

import { mysqlQuery, sql } from '@/lib/mysql';

import * as tenants from './model';

describe('modules/tenants/model', () => {

  describe('#getTenantById', () => {
    it('should get a Tenant by ID', async () => {
      const tenant = await tenants.getTenantById(1);
      assert.deepStrictEqual(tenant, {
        id: 1,
        name: 'ROOT',
        email: 'root@testbank.dev',
        createdAt: new Date('2023-06-24T09:00:00.000Z'),
        updatedAt: new Date('2023-06-24T09:00:00.000Z'),
        deletedAt: null,
      });
    });
  });

  describe('#createTenant', () => {
    afterEach(() => mysqlQuery(sql.delete('Tenant').where('email', 'test@testbank.dev')));

    it('should create a Tenant', async () => {
      const tenantId = await tenants.createTenant({
        name: 'Test Tenant',
        email: 'test@testbank.dev',
      });

      assert.ok(typeof tenantId === 'number', 'Expected tenantId to return a number');
    });

    it('should fail to create a Tenant that already exists', async () => {
      try {
        await tenants.createTenant({
          name: 'Second Root',
          email: 'root@testbank.dev',
        });
        assert.fail('Should have thrown an error');
      } catch (err: any) {
        assert.strictEqual(err.name, 'MysqlError');
        assert.strictEqual(err.message, 'Duplicate entry \'root@testbank.dev\' for key \'Tenant.email\'');
        assert.strictEqual(err.code, 'ER_DUP_ENTRY');
        assert.deepStrictEqual(err.sql, {
          text: 'INSERT INTO `Tenant` (name, email) VALUES (?, ?)',
          values: ['Second Root', 'root@testbank.dev'],
        });
      }
    });
  });

  describe('#updateTenant', () => {
    let tenantId: number;
    before(async () => ({ insertId: tenantId } = await mysqlQuery(sql.insert('Tenant').values({
      name: 'Test Tenant',
      email: 'test@testbank.dev',
    }))));
    after(async () => await mysqlQuery(sql.delete('Tenant').where('id', tenantId)));

    it('should update a Tenant by ID', async () => {
      const updated = await tenants.updateTenantById(tenantId, {
        name: 'Test Tenant 2',
      });

      assert.ok(updated === true, 'Expected updated to return a boolean');
    });

    it('should fail to update a Tenant by ID that doesn\'t exist', async () => {
      const updated = await tenants.updateTenantById(tenantId + 100, {
        name: 'Test Tenant 2',
      });

      assert.ok(updated === false, 'Expected updated to return a boolean');
    });
  });

  describe('#deleteTenant', () => {
    let tenantId: number;
    before(async () => ({ insertId: tenantId } = await mysqlQuery(sql.insert('Tenant').values({
      name: 'Test Tenant',
      email: 'test@testbank.dev',
    }))));
    after(async () => await mysqlQuery(sql.delete('Tenant').where('id', tenantId)));

    it('should delete a Tenant by ID', async () => {
      const deleted = await tenants.deleteTenantById(tenantId);
      assert.ok(deleted === true, 'Expected deleted to return a boolean');
    });

    it('should fail to delete a Tenant by ID that doesn\'t exist', async () => {
      const deleted = await tenants.deleteTenantById(tenantId + 100);
      assert.ok(deleted === false, 'Expected deleted to return a boolean');
    });
  });

});
