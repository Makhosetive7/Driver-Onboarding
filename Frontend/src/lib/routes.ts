import type { UserMe } from '../api/client';

export function needsOnboarding(
  user: Pick<UserMe, 'role' | 'application_status'> | null | undefined,
): boolean {
  if (!user || user.role !== 'DRIVER') return false;
  return user.application_status === 'DRAFT';
}

export function postAuthPath(
  user: Pick<UserMe, 'role' | 'phone_verified' | 'application_status'> | null | undefined,
): string {
  if (!user) return '/login';
  if (user.role === 'ADMIN') return '/admin';
  if (!user.phone_verified) return '/verify';
  if (needsOnboarding(user)) return '/onboarding/personal';
  return '/dashboard';
}
