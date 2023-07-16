import assert from 'http-assert-plus';
import Hashids from 'hashids';

import { hashIdSecrets } from '../config';

const hashid = new Hashids(hashIdSecrets.tenants);

export function encodeTenantId(tenantId: number): string {
  return hashid.encode([tenantId]);
}

export function decodeTenantId(encoded: string): number {
  const [tenantId] = hashid.decode(encoded);
  assert(typeof tenantId === 'number', 400, 'Missing tenantId from encoded accountId');
  return tenantId;
}
