import assert from 'http-assert-plus';
import Hashids from 'hashids';

const tenantHashId = new Hashids('140f81');

/**
 * Encode a tenant ID from a number
 */
export function encodeTenantId(tenantId: number): string {
  return tenantHashId.encode([ tenantId ]);
}

/**
 * Decode a tenant ID from a string
 */
export function decodeTenantId(encoded: string): number {
  const [ tenantId ] = tenantHashId.decode(encoded);
  assert(typeof tenantId === 'number', 400, 'Missing tenantId from encoded accountId');
  return tenantId;
}

const tenantTokenHashId = new Hashids('a65657');

/**
 * Encode tenant token IDs
 */
export function encodeTenantTokenId(tokenId: number): string {
  return tenantTokenHashId.encode([ tokenId ]);
}

/**
 * Decode tenant token IDs
 */
export function decodeTenantTokenId(encoded: string): number {
  const [ tokenId ] = tenantTokenHashId.decode(encoded);
  assert(typeof tokenId === 'number', 400, 'Missing tokenId from encoded tenantTokenId');
  return tokenId;
}

const accountHashId = new Hashids('208911');

/**
 * Encode an account ID from a tenantId & accountId
 */
export function encodeAccountId(accountId: number): string {
  return accountHashId.encode([ accountId ]);
}

/**
 * Decode an encoded Account ID
 */
export function decodeAccountId(encoded: string): number {
  const [ accountId ] = accountHashId.decode(encoded);
  assert(typeof accountId === 'number', 400, 'Missing accountId from encoded accountId');
  return accountId;
}

const transactionHashId = new Hashids('00b6f3');

/**
 * Encode transaction IDs
 */
export function encodeTransactionId(transactionId: number): string {
  return transactionHashId.encode([ transactionId ]);
}

/**
 * Decode transaction IDs
 */
export function decodeTransactionId(encoded: string): number {
  const [ transactionId ] = transactionHashId.decode(encoded);
  assert(typeof transactionId === 'number', 400, 'Missing transactionId from encoded tenantTokenId');
  return transactionId;
}
