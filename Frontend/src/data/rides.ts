export type RideOffer = {
  id: string;
  pickup: string;
  dropoff: string;
  area: string;
  distanceKm: number;
  etaMin: number;
  payout: number;
  currency: string;
  packageLabel: string;
  weightKg: number;
  urgency: 'standard' | 'express';
  postedAgo: string;
};

/** Demo marketplace listings — not backed by a booking API yet. */
export const DEMO_RIDES: RideOffer[] = [
  {
    id: 'r1',
    pickup: 'Avondale Market',
    dropoff: 'Borrowdale Brooke',
    area: 'Harare North',
    distanceKm: 8.4,
    etaMin: 22,
    payout: 12.5,
    currency: 'USD',
    packageLabel: 'Grocery bag',
    weightKg: 6,
    urgency: 'express',
    postedAgo: '2 min ago',
  },
  {
    id: 'r2',
    pickup: 'Sam Levy Village',
    dropoff: 'Mount Pleasant',
    area: 'Harare North',
    distanceKm: 4.1,
    etaMin: 14,
    payout: 7.0,
    currency: 'USD',
    packageLabel: 'Pharmacy parcel',
    weightKg: 1.2,
    urgency: 'express',
    postedAgo: '5 min ago',
  },
  {
    id: 'r3',
    pickup: 'CBD — First Street',
    dropoff: 'Mbare Musika',
    area: 'Harare Central',
    distanceKm: 6.8,
    etaMin: 28,
    payout: 9.5,
    currency: 'USD',
    packageLabel: 'Electronics box',
    weightKg: 4.5,
    urgency: 'standard',
    postedAgo: '8 min ago',
  },
  {
    id: 'r4',
    pickup: 'Eastgate Mall',
    dropoff: 'Msasa Industrial',
    area: 'Harare East',
    distanceKm: 5.2,
    etaMin: 18,
    payout: 8.25,
    currency: 'USD',
    packageLabel: 'Office supplies',
    weightKg: 9,
    urgency: 'standard',
    postedAgo: '12 min ago',
  },
  {
    id: 'r5',
    pickup: 'Westgate',
    dropoff: 'Warren Park',
    area: 'Harare West',
    distanceKm: 7.6,
    etaMin: 24,
    payout: 10.0,
    currency: 'USD',
    packageLabel: 'Household goods',
    weightKg: 11,
    urgency: 'standard',
    postedAgo: '15 min ago',
  },
  {
    id: 'r6',
    pickup: 'Airport Road depot',
    dropoff: 'Hatfield',
    area: 'Harare South',
    distanceKm: 11.3,
    etaMin: 32,
    payout: 15.75,
    currency: 'USD',
    packageLabel: 'Fragile crate',
    weightKg: 8,
    urgency: 'express',
    postedAgo: '18 min ago',
  },
  {
    id: 'r7',
    pickup: 'Belgravia shops',
    dropoff: 'Newlands',
    area: 'Harare North',
    distanceKm: 3.4,
    etaMin: 12,
    payout: 5.5,
    currency: 'USD',
    packageLabel: 'Food delivery',
    weightKg: 2.1,
    urgency: 'express',
    postedAgo: '21 min ago',
  },
  {
    id: 'r8',
    pickup: 'Chitungwiza town centre',
    dropoff: 'Seke Unit L',
    area: 'Chitungwiza',
    distanceKm: 4.9,
    etaMin: 16,
    payout: 6.75,
    currency: 'USD',
    packageLabel: 'Clothing parcel',
    weightKg: 3,
    urgency: 'standard',
    postedAgo: '27 min ago',
  },
];
