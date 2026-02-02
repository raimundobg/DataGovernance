import { ParsedIdentity } from './parser';
import { ROLES, CRITICALITY_LEVELS, Role, CriticalityLevel } from '@/config/constants';

export interface ValidationResult {
  validIdentities: ParsedIdentity[];
  invalidIdentities: InvalidIdentity[];
  invalidCount: number;
  errors: ValidationError[];
}

export interface InvalidIdentity {
  identity: ParsedIdentity;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  value?: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email: string): ValidationError | null {
  if (!email || email.trim() === '') {
    return { field: 'email', message: 'Email is required' };
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    return { field: 'email', message: 'Invalid email format', value: email };
  }

  return null;
}

function validateRole(role: string): ValidationError | null {
  const normalizedRole = role.toLowerCase().trim();
  const validRoles = Object.keys(ROLES);

  if (role && !validRoles.includes(normalizedRole)) {
    return {
      field: 'role',
      message: `Invalid role. Valid values: ${validRoles.join(', ')}`,
      value: role,
    };
  }

  return null;
}

function validateCriticality(criticality: string): ValidationError | null {
  const normalizedCriticality = criticality.toLowerCase().trim();
  const validLevels = Object.keys(CRITICALITY_LEVELS);

  if (criticality && !validLevels.includes(normalizedCriticality)) {
    return {
      field: 'criticality',
      message: `Invalid criticality. Valid values: ${validLevels.join(', ')}`,
      value: criticality,
    };
  }

  return null;
}

function normalizeIdentity(identity: ParsedIdentity): ParsedIdentity {
  const normalizedRole = identity.role.toLowerCase().trim();
  const normalizedCriticality = identity.criticality.toLowerCase().trim();

  return {
    email: identity.email.toLowerCase().trim(),
    name: identity.name.trim() || identity.email.split('@')[0],
    role: (Object.keys(ROLES).includes(normalizedRole) ? normalizedRole : 'other') as Role,
    area: identity.area.trim() || 'Other',
    criticality: (Object.keys(CRITICALITY_LEVELS).includes(normalizedCriticality)
      ? normalizedCriticality
      : 'medium') as CriticalityLevel,
  };
}

export function validateIdentity(identity: ParsedIdentity): ValidationError[] {
  const errors: ValidationError[] = [];

  const emailError = validateEmail(identity.email);
  if (emailError) errors.push(emailError);

  const roleError = validateRole(identity.role);
  if (roleError) errors.push(roleError);

  const criticalityError = validateCriticality(identity.criticality);
  if (criticalityError) errors.push(criticalityError);

  return errors;
}

export function validateIdentities(identities: ParsedIdentity[]): ValidationResult {
  const validIdentities: ParsedIdentity[] = [];
  const invalidIdentities: InvalidIdentity[] = [];
  const allErrors: ValidationError[] = [];

  for (const identity of identities) {
    const errors = validateIdentity(identity);

    if (errors.length === 0) {
      validIdentities.push(normalizeIdentity(identity));
    } else {
      invalidIdentities.push({ identity, errors });
      allErrors.push(...errors);
    }
  }

  return {
    validIdentities,
    invalidIdentities,
    invalidCount: invalidIdentities.length,
    errors: allErrors,
  };
}
