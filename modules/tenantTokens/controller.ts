import assert from 'http-assert-plus';
import Hashids from 'hashids';

import { hashIdSecrets } from '../config';

const hashid = new Hashids(hashIdSecrets.tenantTokens);

export function encodeTenantTokenId(tenantId: number, tokenId: number): string {
  return hashid.encode([tenantId, tokenId]);
}

export function decodeTenantTokenId(encoded: string): [number, number] {
  const [tenantId, tokenId] = hashid.decode(encoded);
  assert(typeof tenantId === 'number', 400, 'Missing tenantId from encoded tenantTokenId');
  assert(typeof tokenId === 'number', 400, 'Missing tokenId from encoded tenantTokenId');
  return [tenantId, tokenId];
}
