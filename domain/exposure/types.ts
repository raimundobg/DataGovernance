export interface BreachData {
  source: string;
  breachDate: string;
  dataTypes: string[];
  verified: boolean;
}

export interface ExposureResult {
  email: string;
  isExposed: boolean;
  breachCount: number;
  breaches: BreachData[];
  lastBreachDate?: string;
  checkedAt: string;
}

export interface ExposureCheckInput {
  emails: string[];
  projectId: string;
}

export interface ExposureCheckOutput {
  results: ExposureResult[];
  totalChecked: number;
  totalExposed: number;
  checkId: string;
  completedAt: string;
}

export interface ExposureCheckProgress {
  checkId: string;
  totalEmails: number;
  processedEmails: number;
  progress: number;
  status: 'pending' | 'running' | 'completed' | 'failed';
  error?: string;
}
