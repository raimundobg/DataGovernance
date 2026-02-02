import SHA256 from 'crypto-js/sha256';

export function hashString(data: string): string {
  return SHA256(data).toString();
}

export function hashObject(data: unknown): string {
  const serialized = JSON.stringify(data, null, 0);
  return hashString(serialized);
}

export function hashArray<T>(items: T[]): string {
  const serialized = items.map((item) => JSON.stringify(item)).join('|');
  return hashString(serialized);
}

export function verifyHash(data: string, expectedHash: string): boolean {
  const computedHash = hashString(data);
  return computedHash === expectedHash;
}

export function computeChainHash(
  eventHash: string,
  previousHash: string
): string {
  return hashString(`${previousHash}:${eventHash}`);
}

export function generateDatasetHash(emails: string[]): string {
  const sorted = [...emails].sort();
  return hashArray(sorted);
}
