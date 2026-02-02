import { ParsedIdentity } from './parser';

export interface DeduplicationResult {
  identities: ParsedIdentity[];
  duplicatesRemoved: number;
  duplicateEmails: string[];
}

export function deduplicateIdentities(identities: ParsedIdentity[]): DeduplicationResult {
  const seen = new Map<string, ParsedIdentity>();
  const duplicateEmails: string[] = [];

  for (const identity of identities) {
    const email = identity.email.toLowerCase();

    if (seen.has(email)) {
      duplicateEmails.push(email);
    } else {
      seen.set(email, identity);
    }
  }

  return {
    identities: Array.from(seen.values()),
    duplicatesRemoved: duplicateEmails.length,
    duplicateEmails,
  };
}

export function mergeIdentities(
  existing: ParsedIdentity[],
  newIdentities: ParsedIdentity[]
): DeduplicationResult {
  const existingEmails = new Set(existing.map((i) => i.email.toLowerCase()));
  const duplicateEmails: string[] = [];
  const toAdd: ParsedIdentity[] = [];

  for (const identity of newIdentities) {
    const email = identity.email.toLowerCase();

    if (existingEmails.has(email)) {
      duplicateEmails.push(email);
    } else {
      existingEmails.add(email);
      toAdd.push(identity);
    }
  }

  return {
    identities: [...existing, ...toAdd],
    duplicatesRemoved: duplicateEmails.length,
    duplicateEmails,
  };
}
