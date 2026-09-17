/** Human-readable labels for API enum values shown in the UI. */

export const IDENTITY_TYPE_LABELS: Record<string, string> = {
  NATIONAL_ID: 'National ID',
  PASSPORT: 'Passport',
  DRIVERS_LICENCE: "Driver's licence",
};

export const VEHICLE_TYPE_LABELS: Record<string, string> = {
  MOTORCYCLE: 'Motorcycle',
  CAR: 'Car',
  PICKUP: 'Pickup',
  VAN: 'Van',
  TRUCK: 'Truck',
};

export const STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  PENDING_REVIEW: 'Pending review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

export function formatLabel(map: Record<string, string>, value?: string | null) {
  if (!value) return '—';
  return map[value] || value.replaceAll('_', ' ').toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}
