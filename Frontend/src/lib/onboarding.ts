import type { ApplicationReview, DocumentItem, Identity, Profile, Vehicle } from '../api/client';

export const ONBOARDING_STEPS = [
  { path: '/verify', label: 'Verify' },
  { path: '/onboarding/personal', label: 'Personal' },
  { path: '/onboarding/identity', label: 'Identity' },
  { path: '/onboarding/vehicle', label: 'Vehicle' },
  { path: '/onboarding/documents', label: 'Documents' },
  { path: '/onboarding/review', label: 'Review' },
] as const;

export const REQUIRED_DOC_TYPES = [
  'DRIVERS_LICENCE',
  'IDENTITY_DOCUMENT',
  'VEHICLE_REGISTRATION',
  'INSURANCE',
  'ROADWORTHINESS',
] as const;

export function isPersonalComplete(profile: Profile | null): boolean {
  return Boolean(
    profile?.first_name &&
      profile?.last_name &&
      profile?.date_of_birth &&
      profile?.address &&
      profile?.city,
  );
}

export function isIdentityComplete(
  identity: Identity | null,
  documents: DocumentItem[] = [],
): boolean {
  const hasDoc =
    Boolean(identity?.has_document) ||
    documents.some((d) => d.document_type === 'IDENTITY_DOCUMENT');
  return Boolean(identity?.identity_type && identity?.identity_number && hasDoc);
}

export function isVehicleComplete(vehicle: Vehicle | null): boolean {
  return Boolean(
    vehicle?.vehicle_type &&
      vehicle?.make &&
      vehicle?.model &&
      vehicle?.year &&
      vehicle?.registration_number &&
      vehicle?.colour &&
      vehicle?.ownership,
  );
}

export function isDocumentsComplete(documents: DocumentItem[]): boolean {
  const types = new Set(documents.map((d) => d.document_type));
  return REQUIRED_DOC_TYPES.every((type) => types.has(type));
}

export function firstIncompleteOnboardingPath(data: ApplicationReview): string {
  if (!isPersonalComplete(data.profile)) return '/onboarding/personal';
  if (!isIdentityComplete(data.identity, data.documents)) return '/onboarding/identity';
  if (!isVehicleComplete(data.vehicle)) return '/onboarding/vehicle';
  if (!isDocumentsComplete(data.documents)) return '/onboarding/documents';
  return '/onboarding/review';
}

const FORM_PATHS = ONBOARDING_STEPS.filter((step) => step.path.startsWith('/onboarding')).map(
  (step) => step.path,
);

export function canAccessOnboardingPath(path: string, data: ApplicationReview): boolean {
  const status = data.application.status;
  if (status === 'PENDING_REVIEW' || status === 'APPROVED' || status === 'REJECTED') {
    return path === '/onboarding/review' || path === '/onboarding/submitted';
  }
  if (path === '/onboarding/submitted') return false;
  const first = firstIncompleteOnboardingPath(data);
  const pathIndex = (FORM_PATHS as readonly string[]).indexOf(path);
  const firstIndex = (FORM_PATHS as readonly string[]).indexOf(first);
  if (pathIndex === -1 || firstIndex === -1) return false;
  return pathIndex <= firstIndex;
}
