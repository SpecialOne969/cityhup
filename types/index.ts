export type ClientType = 'corporate' | 'individual';
export type ClientStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type PaymentMethod = 'interswitch' | 'remita' | 'paystack';
export type MeansOfId =
  | 'NIN'
  | 'DriversLicense'
  | 'VotersCard'
  | 'InternationalPassport'
  | 'ArtisanUnionID';

export interface ShelfItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
  isOffer?: boolean;
}

export interface IdentificationDoc {
  type: MeansOfId;
  number: string;
  image?: string;
}

export interface Client {
  id: string;
  clientCode: string;
  type: ClientType;
  status: ClientStatus;

  // Field 1 — Location
  natureOfBiz: string;
  country: string;
  state: string;
  lga: string;
  city: string;
  area: string;
  town: string;

  // Field 2 — Business details
  businessName: string;
  address: string;
  email: string;
  phone: string;
  nearestBusStop: string;
  nearestLandmark: string;
  competence: string;
  cacNumber?: string;
  profile: string;
  info: string;
  infoImages: string[];

  // Field 3 — Extra info
  websiteLink?: string;
  shelfItems: ShelfItem[];
  referral?: string;
  director?: string;
  pictures: string[];
  identification?: IdentificationDoc;

  // Subscription / Payment
  paymentBand: number;
  duration: number;
  paymentMethod: PaymentMethod;
  acceptedTerms: boolean;

  // Admin
  approvedBy?: string;
  approvedAt?: string;
  rejectedReason?: string;
  suspendedReason?: string;
  isIndebted?: boolean;
  subscriptionExpiry?: string;
  registeredBy: string;
  registeredAt: string;

  // Category tags
  categories: string[];

  // Rating
  rating?: number;
  reviewCount?: number;
}

export interface Admin {
  id: string;
  adminCode: string;
  name: string;
  email: string;
  city: string;
  state: string;
  isActive: boolean;
  approvalCount: number;
}

export interface Complaint {
  id: string;
  clientId: string;
  reporterName: string;
  reporterPhone: string;
  description: string;
  recommendation?: string;
  status: 'open' | 'reviewed' | 'resolved';
  createdAt: string;
  reviewedAt?: string;
}

export interface Advertisement {
  id: string;
  title: string;
  image: string;
  link?: string;
  isActive: boolean;
}

export interface SearchFilters {
  query: string;
  state?: string;
  lga?: string;
  city?: string;
  category?: string;
  type?: ClientType;
}
