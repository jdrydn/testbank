import assert from 'assert';
import { MongoMemoryReplSet } from 'mongodb-memory-server';

let mongodb: MongoMemoryReplSet | undefined;

export async function startMongoDb() {
  assert(!mongodb, 'Expected mongodb instance to be clear');

  mongodb = await MongoMemoryReplSet.create({
    replSet: { dbName: 'testbank-test' },
  });

  process.env.MONGO_URI = mongodb.getUri();
}

export async function stopMongoDb() {
  if (mongodb) {
    await mongodb.stop();
    process.env.MONGO_URI = undefined;
  }
}

export function getMongoDbUri(): string | undefined {
  return mongodb ? mongodb.getUri() : undefined;
}
