import { MongoClient, ObjectId } from 'mongodb';
import { promiseEachSeries } from '@someimportantcompany/utils';

import * as data from './seed.data';

// Check each data collections to ensure _id is unique!
Object.entries(data).forEach(([ key, values ]) => values.forEach((e1, i1) => {
  if (e1 && e1._id && values.find((e2, i2) => e2 && e2._id === e1._id && i1 !== i2)) {
    throw new Error(`Duplicate ID in ${key} collection: ${e1._id}`);
  }
}));

export async function importData(client: MongoClient) {
  const db = client.db();
  const entries = Object.entries(data);

  function formatRow<T extends { _id: string, [key: string]: any }>(record: T): Omit<T, '_id'> & { _id: ObjectId } {
    return {
      ...record,
      _id: new ObjectId(record._id),
    };
  }

  return client.withSession(async conn => {
    await conn.withTransaction(async session => promiseEachSeries(entries.map(([ k ]) => k), async collection => {
      await db.collection(collection).deleteMany({}, { session });
    }));
    await conn.withTransaction(async session => promiseEachSeries(entries, async ([ collection, rows ]) => {
      await db.collection(collection).insertMany(rows.map(formatRow), { session });
    }));
  });
}
