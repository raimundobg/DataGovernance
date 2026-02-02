import { ExposureResult } from './types';

export interface ManualOverride {
  identityId: string;
  email: string;
  markedExposed: boolean;
  reason?: string;
  markedBy?: string;
  markedAt: string;
}

export interface ManualOverrideInput {
  identityId: string;
  email: string;
  exposed: boolean;
  reason?: string;
  markedBy?: string;
}

class ManualOverrideStore {
  private overrides = new Map<string, ManualOverride>();

  setOverride(input: ManualOverrideInput): ManualOverride {
    const override: ManualOverride = {
      identityId: input.identityId,
      email: input.email.toLowerCase(),
      markedExposed: input.exposed,
      reason: input.reason,
      markedBy: input.markedBy,
      markedAt: new Date().toISOString(),
    };

    this.overrides.set(input.identityId, override);
    return override;
  }

  removeOverride(identityId: string): boolean {
    return this.overrides.delete(identityId);
  }

  getOverride(identityId: string): ManualOverride | undefined {
    return this.overrides.get(identityId);
  }

  hasOverride(identityId: string): boolean {
    return this.overrides.has(identityId);
  }

  getAllOverrides(): ManualOverride[] {
    return Array.from(this.overrides.values());
  }

  applyOverride(identityId: string, result: ExposureResult): ExposureResult {
    const override = this.overrides.get(identityId);

    if (!override) {
      return result;
    }

    return {
      ...result,
      isExposed: override.markedExposed,
    };
  }

  clear(): void {
    this.overrides.clear();
  }
}

export const manualOverrideStore = new ManualOverrideStore();

export function markIdentityExposed(input: ManualOverrideInput): ManualOverride {
  return manualOverrideStore.setOverride(input);
}

export function clearManualOverride(identityId: string): boolean {
  return manualOverrideStore.removeOverride(identityId);
}

export function getManualOverride(identityId: string): ManualOverride | undefined {
  return manualOverrideStore.getOverride(identityId);
}
