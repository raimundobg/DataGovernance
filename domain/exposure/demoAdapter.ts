import { v4 as uuidv4 } from 'uuid';
import { BaseExposureAdapter } from './adapterInterface';
import {
  ExposureCheckInput,
  ExposureCheckOutput,
  ExposureCheckProgress,
  ExposureResult,
  BreachData,
} from './types';

function seededRandom(seed: string): () => number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }

  return function() {
    hash = Math.imul(hash ^ (hash >>> 15), hash | 1);
    hash ^= hash + Math.imul(hash ^ (hash >>> 7), hash | 61);
    return ((hash ^ (hash >>> 14)) >>> 0) / 4294967296;
  };
}

const breachDatabase = [
  { source: 'LinkedIn (2021)', dataTypes: ['email', 'password', 'name'] },
  { source: 'Adobe (2013)', dataTypes: ['email', 'encrypted_password', 'username'] },
  { source: 'Dropbox (2016)', dataTypes: ['email', 'hashed_password'] },
  { source: 'Collection #1 (2019)', dataTypes: ['email', 'password'] },
  { source: 'Canva (2019)', dataTypes: ['email', 'name', 'password'] },
  { source: 'MyFitnessPal (2018)', dataTypes: ['email', 'username', 'ip_address'] },
  { source: 'Zynga (2019)', dataTypes: ['email', 'hashed_password', 'phone'] },
  { source: 'Dubsmash (2018)', dataTypes: ['email', 'password', 'username'] },
  { source: 'Twitter (2022)', dataTypes: ['email', 'phone', 'name'] },
  { source: 'Facebook (2019)', dataTypes: ['email', 'phone', 'location'] },
];

const activeChecks = new Map<string, ExposureCheckProgress>();

export class DemoExposureAdapter extends BaseExposureAdapter {
  readonly name = 'demo';
  readonly version = '1.0.0';

  async checkEmails(input: ExposureCheckInput): Promise<ExposureCheckOutput> {
    const checkId = uuidv4();
    const results: ExposureResult[] = [];

    activeChecks.set(checkId, {
      checkId,
      totalEmails: input.emails.length,
      processedEmails: 0,
      progress: 0,
      status: 'running',
    });

    for (let i = 0; i < input.emails.length; i++) {
      const email = this.normalizeEmail(input.emails[i]);
      const result = await this.checkSingleEmail(email);
      results.push(result);

      activeChecks.set(checkId, {
        checkId,
        totalEmails: input.emails.length,
        processedEmails: i + 1,
        progress: Math.round(((i + 1) / input.emails.length) * 100),
        status: 'running',
      });

      await new Promise(resolve => setTimeout(resolve, 20));
    }

    activeChecks.set(checkId, {
      checkId,
      totalEmails: input.emails.length,
      processedEmails: input.emails.length,
      progress: 100,
      status: 'completed',
    });

    return {
      results,
      totalChecked: results.length,
      totalExposed: results.filter(r => r.isExposed).length,
      checkId,
      completedAt: new Date().toISOString(),
    };
  }

  async checkSingleEmail(email: string): Promise<ExposureResult> {
    const normalizedEmail = this.normalizeEmail(email);
    const random = seededRandom(normalizedEmail);

    const breachProbability = random();
    const isExposed = breachProbability < 0.65;

    if (!isExposed) {
      return {
        email: normalizedEmail,
        isExposed: false,
        breachCount: 0,
        breaches: [],
        checkedAt: new Date().toISOString(),
      };
    }

    const breachCount = Math.min(Math.floor(random() * 4) + 1, breachDatabase.length);
    const breaches: BreachData[] = [];
    const usedSources = new Set<string>();

    for (let i = 0; i < breachCount; i++) {
      const sourceIndex = Math.floor(random() * breachDatabase.length);
      const source = breachDatabase[sourceIndex];

      if (usedSources.has(source.source)) continue;
      usedSources.add(source.source);

      const daysAgo = Math.floor(random() * 1500) + 30;
      const breachDate = new Date();
      breachDate.setDate(breachDate.getDate() - daysAgo);

      breaches.push({
        source: source.source,
        breachDate: breachDate.toISOString().split('T')[0],
        dataTypes: source.dataTypes,
        verified: random() > 0.2,
      });
    }

    breaches.sort((a, b) => new Date(b.breachDate).getTime() - new Date(a.breachDate).getTime());

    return {
      email: normalizedEmail,
      isExposed: true,
      breachCount: breaches.length,
      breaches,
      lastBreachDate: breaches[0]?.breachDate,
      checkedAt: new Date().toISOString(),
    };
  }

  async getCheckProgress(checkId: string): Promise<ExposureCheckProgress> {
    const progress = activeChecks.get(checkId);

    if (!progress) {
      return {
        checkId,
        totalEmails: 0,
        processedEmails: 0,
        progress: 0,
        status: 'completed',
      };
    }

    return progress;
  }

  async cancelCheck(checkId: string): Promise<boolean> {
    const progress = activeChecks.get(checkId);
    if (progress && progress.status === 'running') {
      activeChecks.set(checkId, {
        ...progress,
        status: 'failed',
        error: 'Check cancelled by user',
      });
      return true;
    }
    return false;
  }
}

export const demoExposureAdapter = new DemoExposureAdapter();
