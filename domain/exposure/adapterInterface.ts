import {
  ExposureCheckInput,
  ExposureCheckOutput,
  ExposureCheckProgress,
  ExposureResult,
} from './types';

export interface ExposureAdapter {
  readonly name: string;
  readonly version: string;

  checkEmails(input: ExposureCheckInput): Promise<ExposureCheckOutput>;

  checkSingleEmail(email: string): Promise<ExposureResult>;

  getCheckProgress(checkId: string): Promise<ExposureCheckProgress>;

  cancelCheck(checkId: string): Promise<boolean>;

  isAvailable(): Promise<boolean>;
}

export abstract class BaseExposureAdapter implements ExposureAdapter {
  abstract readonly name: string;
  abstract readonly version: string;

  abstract checkEmails(input: ExposureCheckInput): Promise<ExposureCheckOutput>;

  abstract checkSingleEmail(email: string): Promise<ExposureResult>;

  abstract getCheckProgress(checkId: string): Promise<ExposureCheckProgress>;

  async cancelCheck(_checkId: string): Promise<boolean> {
    return false;
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }

  protected validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  protected normalizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }
}
