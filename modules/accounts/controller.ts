import assert from 'http-assert-plus';
import Hashids from 'hashids';

import { hashIdSecrets } from '../config';

const hashid = new Hashids(hashIdSecrets.accounts);

export function encodeAccountId(tenantId: number, accountId: number): string {
  return hashid.encode([tenantId, accountId]);
}

export function decodeAccountId(encoded: string): [number, number] {
  const [tenantId, accountId] = hashid.decode(encoded);
  assert(typeof tenantId === 'number', 400, 'Missing tenantId from encoded accountId');
  assert(typeof accountId === 'number', 400, 'Missing accountId from encoded accountId');
  return [tenantId, accountId];
}
