/* eslint-disable no-console */
import assert from 'assert';

import { createMongoClient } from '@/lib/mongodb';

import { startMongoDb, stopMongoDb, getMongoDbUri } from './mongodb';
import { importData } from './seed.import';

Object.assign(process.env, {
  NODE_ENV: 'testing',
  LOG_LEVEL: process.env.LOG_LEVEL ?? 'fatal',
});

before(async function setup() {
  if (!process.env.MONGO_URI) {
    this.timeout(5000);
    await startMongoDb();
  }

  console.log('MongoDB: %s\n', process.env.MONGO_URI);

  const mongodb = createMongoClient();
  await importData(mongodb);

  const db = mongodb.db();
  const [ tenantsCount ] = await Promise.all([
    db.collection('tenants').countDocuments(),
  ]);

  assert.ok(tenantsCount > 0, 'Expected Tenants collection to have entries');
});

after(async () => {
  if (getMongoDbUri()) {
    await stopMongoDb();
  }
});
