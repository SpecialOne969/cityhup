export const PAYMENT_BANDS = [
  { label: '₦1,000', value: 1000 },
  { label: '₦2,000', value: 2000 },
  { label: '₦3,000', value: 3000 },
  { label: '₦4,000', value: 4000 },
  { label: '₦5,000', value: 5000 },
  { label: '₦10,000', value: 10000 },
  { label: 'Others (Negotiated)', value: 0 },
];

export const DURATIONS = Array.from({ length: 12 }, (_, i) => ({
  label: i === 0 ? '1 Month' : `${i + 1} Months`,
  value: i + 1,
}));

export const PAYMENT_METHODS = [
  { label: 'Interswitch', value: 'interswitch' },
  { label: 'Remita', value: 'remita' },
  { label: 'Paystack', value: 'paystack' },
] as const;

export const MEANS_OF_ID = [
  { label: 'NIN (National Identification Number)', value: 'NIN' },
  { label: "Driver's License", value: 'DriversLicense' },
  { label: "Voter's Card", value: 'VotersCard' },
  { label: 'International Passport', value: 'InternationalPassport' },
  { label: 'Artisan Union ID Card', value: 'ArtisanUnionID' },
] as const;

export const NATURE_OF_BIZ_OPTIONS = [
  'Artisan / Skilled Trade',
  'Automobile',
  'Beauty & Wellness',
  'Building & Construction',
  'Catering & Food',
  'Education',
  'Entertainment & Events',
  'Fashion & Clothing',
  'Finance & Banking',
  'General Merchandise',
  'Health & Medical',
  'Hospitality (Hotel/Lodge)',
  'Industrial / Manufacturing',
  'IT & Technology',
  'Logistics & Transportation',
  'Property & Real Estate',
  'Retail (Supermarket/Store)',
  'Travels & Tourism',
  'Other',
];
