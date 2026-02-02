export type {
  BreachData,
  ExposureResult,
  ExposureCheckInput,
  ExposureCheckOutput,
  ExposureCheckProgress,
} from './types';

export type { ExposureAdapter } from './adapterInterface';
export { BaseExposureAdapter } from './adapterInterface';

export { DemoExposureAdapter, demoExposureAdapter } from './demoAdapter';

export {
  manualOverrideStore,
  markIdentityExposed,
  clearManualOverride,
  getManualOverride,
} from './manualOverride';
export type { ManualOverride, ManualOverrideInput } from './manualOverride';
