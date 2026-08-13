import { createClient } from '@supabase/supabase-js';
import { Client, Admin, Customer, Complaint } from '../types';

export const supabase = createClient(
  'https://udwfsahkujngleoncfey.supabase.co',
  'sb_publishable_HL9X-uZxAaugfazdAg_Rdw_6vdy9O8P'
);

export function dbToClient(row: any): Client {
  return {
    id: row.id,
    clientCode: row.client_code,
    type: row.type,
    status: row.status,
    natureOfBiz: row.nature_of_biz ?? '',
    country: row.country ?? 'Nigeria',
    state: row.state ?? '',
    lga: row.lga ?? '',
    city: row.city ?? '',
    area: row.area ?? '',
    town: row.town ?? '',
    businessName: row.business_name ?? '',
    address: row.address ?? '',
    email: row.email ?? '',
    phone: row.phone ?? '',
    nearestBusStop: row.nearest_bus_stop ?? '',
    nearestLandmark: row.nearest_landmark ?? '',
    competence: row.competence ?? '',
    cacNumber: row.cac_number ?? undefined,
    profile: row.profile ?? '',
    info: row.info ?? '',
    infoImages: row.info_images ?? [],
    websiteLink: row.website_link ?? undefined,
    shelfItems: row.shelf_items ?? [],
    referral: row.referral ?? undefined,
    director: row.director ?? undefined,
    pictures: row.pictures ?? [],
    identification: row.identification ?? undefined,
    paymentBand: row.payment_band ?? 0,
    duration: row.duration ?? 1,
    paymentMethod: row.payment_method ?? 'paystack',
    acceptedTerms: row.accepted_terms ?? false,
    subscriptionExpiry: row.subscription_expiry ?? undefined,
    approvedBy: row.approved_by ?? undefined,
    approvedAt: row.approved_at ?? undefined,
    rejectedReason: row.rejected_reason ?? undefined,
    suspendedReason: row.suspended_reason ?? undefined,
    isIndebted: row.is_indebted ?? false,
    registeredBy: row.registered_by ?? '',
    registeredAt: row.registered_at ?? new Date().toISOString(),
    categories: row.categories ?? [],
    rating: row.rating ?? undefined,
    reviewCount: row.review_count ?? 0,
  };
}

export function clientToDb(client: Partial<Client>): Record<string, any> {
  const row: Record<string, any> = {};
  if (client.clientCode !== undefined) row.client_code = client.clientCode;
  if (client.type !== undefined) row.type = client.type;
  if (client.status !== undefined) row.status = client.status;
  if (client.natureOfBiz !== undefined) row.nature_of_biz = client.natureOfBiz;
  if (client.country !== undefined) row.country = client.country;
  if (client.state !== undefined) row.state = client.state;
  if (client.lga !== undefined) row.lga = client.lga;
  if (client.city !== undefined) row.city = client.city;
  if (client.area !== undefined) row.area = client.area;
  if (client.town !== undefined) row.town = client.town;
  if (client.businessName !== undefined) row.business_name = client.businessName;
  if (client.address !== undefined) row.address = client.address;
  if (client.email !== undefined) row.email = client.email;
  if (client.phone !== undefined) row.phone = client.phone;
  if (client.nearestBusStop !== undefined) row.nearest_bus_stop = client.nearestBusStop;
  if (client.nearestLandmark !== undefined) row.nearest_landmark = client.nearestLandmark;
  if (client.competence !== undefined) row.competence = client.competence;
  if (client.cacNumber !== undefined) row.cac_number = client.cacNumber;
  if (client.profile !== undefined) row.profile = client.profile;
  if (client.info !== undefined) row.info = client.info;
  if (client.infoImages !== undefined) row.info_images = client.infoImages;
  if (client.websiteLink !== undefined) row.website_link = client.websiteLink;
  if (client.shelfItems !== undefined) row.shelf_items = client.shelfItems;
  if (client.referral !== undefined) row.referral = client.referral;
  if (client.director !== undefined) row.director = client.director;
  if (client.pictures !== undefined) row.pictures = client.pictures;
  if (client.identification !== undefined) row.identification = client.identification;
  if (client.paymentBand !== undefined) row.payment_band = client.paymentBand;
  if (client.duration !== undefined) row.duration = client.duration;
  if (client.paymentMethod !== undefined) row.payment_method = client.paymentMethod;
  if (client.acceptedTerms !== undefined) row.accepted_terms = client.acceptedTerms;
  if (client.subscriptionExpiry !== undefined) row.subscription_expiry = client.subscriptionExpiry;
  if (client.approvedBy !== undefined) row.approved_by = client.approvedBy;
  if (client.approvedAt !== undefined) row.approved_at = client.approvedAt;
  if (client.rejectedReason !== undefined) row.rejected_reason = client.rejectedReason;
  if (client.suspendedReason !== undefined) row.suspended_reason = client.suspendedReason;
  if (client.isIndebted !== undefined) row.is_indebted = client.isIndebted;
  if (client.registeredBy !== undefined) row.registered_by = client.registeredBy;
  if (client.registeredAt !== undefined) row.registered_at = client.registeredAt;
  if (client.categories !== undefined) row.categories = client.categories;
  if (client.rating !== undefined) row.rating = client.rating;
  if (client.reviewCount !== undefined) row.review_count = client.reviewCount;
  return row;
}

export function dbToAdmin(row: any): Admin {
  return {
    id: row.id,
    adminCode: row.admin_code,
    name: row.name,
    email: row.email,
    city: row.city ?? '',
    state: row.state ?? '',
    isActive: row.is_active ?? true,
    approvalCount: row.approval_count ?? 0,
  };
}

export function dbToCustomer(row: any): Customer {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone ?? undefined,
    state: row.state ?? undefined,
    lga: row.lga ?? undefined,
    interestedCategories: row.interested_categories ?? [],
    registeredAt: row.registered_at,
  };
}

export function dbToComplaint(row: any): Complaint {
  return {
    id: row.id,
    clientId: row.client_id,
    reporterName: row.reporter_name,
    reporterPhone: row.reporter_phone,
    description: row.description,
    recommendation: row.recommendation ?? undefined,
    status: row.status,
    createdAt: row.created_at,
    reviewedAt: row.reviewed_at ?? undefined,
  };
}
