import assert from 'http-assert-plus';
import { MongoClient, ClientSession, ObjectId } from 'mongodb'; // eslint-disable-line import/no-import-module-exports

export type { ClientSession as mongoSession, ObjectId as mongoObjectId };

let mongodb: MongoClient;
/**
 * Create a MongoDB client
 */
export function createMongoClient(): MongoClient {
  assert(process.env.MONGO_URI, new TypeError('Missing MONGO_URI from process.env'));

  if (!mongodb) {
    mongodb = new MongoClient(process.env.MONGO_URI!);
  }

  return mongodb;
}

/**
 * Create a new ObjectId on the fly.
 */
export function createObjectId(input?: string | ObjectId): ObjectId {
  return new ObjectId(input);
}

/**
 * Create a new ObjectId on the fly.
 */
export function isValidObjectId(id: string | ObjectId): boolean {
  return ObjectId.isValid(id);
}

export async function withTransaction<T>(
  // eslint-disable-next-line no-unused-vars
  fn: (session: ClientSession) => Promise<T>,
): Promise<T>;
export async function withTransaction<T>( // eslint-disable-line no-redeclare
  // eslint-disable-next-line no-unused-vars, no-shadow
  session: ClientSession, fn: (session: ClientSession) => Promise<T>,
): Promise<T>;
/**
 * Execute statements within a single transaction
 */
export async function withTransaction<T>(// eslint-disable-line no-redeclare
  // eslint-disable-next-line no-unused-vars
  ...args: [ClientSession, (session: ClientSession) => Promise<T>] | [(session: ClientSession) => Promise<T>]
): Promise<T> {
  if (args.length === 2) {
    const [ session, fn ] = args;
    if (session.inTransaction()) {
      return fn(session);
    } else {
      return session.withTransaction(fn);
    }
  } else {
    const [ fn ] = args;
    return mongodb.withSession(session => session.withTransaction(fn));
  }
}
