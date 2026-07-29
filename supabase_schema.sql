-- ============================================================
-- CityHup Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- CLIENTS TABLE
CREATE TABLE IF NOT EXISTS clients (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  client_code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('corporate', 'individual')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  nature_of_biz TEXT,
  country TEXT DEFAULT 'Nigeria',
  state TEXT,
  lga TEXT,
  city TEXT,
  area TEXT,
  town TEXT,
  business_name TEXT,
  address TEXT,
  email TEXT,
  phone TEXT,
  nearest_bus_stop TEXT,
  nearest_landmark TEXT,
  competence TEXT,
  cac_number TEXT,
  profile TEXT,
  info TEXT,
  info_images JSONB DEFAULT '[]',
  website_link TEXT,
  shelf_items JSONB DEFAULT '[]',
  referral TEXT,
  director TEXT,
  pictures JSONB DEFAULT '[]',
  identification JSONB,
  payment_band INTEGER,
  duration INTEGER,
  payment_method TEXT,
  accepted_terms BOOLEAN DEFAULT false,
  subscription_expiry TIMESTAMPTZ,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  rejected_reason TEXT,
  suspended_reason TEXT,
  is_indebted BOOLEAN DEFAULT false,
  registered_by TEXT,
  registered_at TIMESTAMPTZ DEFAULT NOW(),
  categories JSONB DEFAULT '[]',
  rating NUMERIC(3,1),
  review_count INTEGER DEFAULT 0
);

-- ADMINS TABLE (linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  admin_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  city TEXT,
  state TEXT,
  is_active BOOLEAN DEFAULT true,
  approval_count INTEGER DEFAULT 0
);

-- COMPLAINTS TABLE
CREATE TABLE IF NOT EXISTS complaints (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  client_id TEXT REFERENCES clients(id) ON DELETE CASCADE,
  reporter_name TEXT,
  reporter_phone TEXT,
  description TEXT,
  recommendation TEXT,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'reviewed', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ
);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

-- CLIENTS: public can see approved + non-indebted listings
CREATE POLICY "public_read_approved_clients" ON clients
  FOR SELECT USING (status = 'approved' AND (is_indebted IS NULL OR is_indebted = false));

-- CLIENTS: authenticated admins can see ALL clients
CREATE POLICY "admin_read_all_clients" ON clients
  FOR SELECT TO authenticated USING (true);

-- CLIENTS: anyone can register (insert)
CREATE POLICY "public_insert_client" ON clients
  FOR INSERT WITH CHECK (true);

-- CLIENTS: only admins can update
CREATE POLICY "admin_update_client" ON clients
  FOR UPDATE TO authenticated USING (true);

-- ADMINS: public can read (needed for email lookup by code during login)
CREATE POLICY "public_read_admins" ON admins
  FOR SELECT USING (true);

-- ADMINS: authenticated admins can update own record
CREATE POLICY "admin_update_self" ON admins
  FOR UPDATE TO authenticated USING (auth.uid() = id);

-- COMPLAINTS: anyone can submit
CREATE POLICY "public_insert_complaint" ON complaints
  FOR INSERT WITH CHECK (true);

-- COMPLAINTS: only admins can read
CREATE POLICY "admin_read_complaints" ON complaints
  FOR SELECT TO authenticated USING (true);

-- COMPLAINTS: only admins can update (mark as reviewed/resolved)
CREATE POLICY "admin_update_complaint" ON complaints
  FOR UPDATE TO authenticated USING (true);

-- ============================================================
-- SEED DATA (optional — 4 demo clients)
-- ============================================================

INSERT INTO clients (id, client_code, type, status, nature_of_biz, country, state, lga, city, area, town, business_name, address, email, phone, nearest_bus_stop, nearest_landmark, competence, cac_number, profile, info, info_images, website_link, shelf_items, referral, director, pictures, payment_band, duration, payment_method, accepted_terms, approved_by, approved_at, registered_by, registered_at, categories, rating, review_count)
VALUES
(
  'client-001', 'CH-RVS-100001', 'corporate', 'approved',
  'Building & Construction', 'Nigeria', 'Rivers', 'Port Harcourt', 'Port Harcourt', 'GRA Phase 2', 'Port Harcourt',
  'Solvay Construction Ltd', '12 Tombia Street, GRA Phase 2, Port Harcourt',
  'info@solvayconstruction.ng', '08012345678',
  'Rumuola Junction', 'Shell Camp',
  'Civil Engineering, Building, Renovation', 'RC-1234567',
  'We are a leading construction company based in Port Harcourt with over 15 years of experience in residential and commercial construction.',
  'Specialized in high-rise buildings, estate development, and renovation works.',
  '[]', 'https://solvayconstruction.ng', '[]', 'City Hup Marketing Team', 'Engr. Solomon Diko', '[]',
  10000, 12, 'paystack', true,
  'ADM-PH-001', '2026-01-15T10:00:00Z', 'AGT-PH-005', '2026-01-10T09:00:00Z',
  '["house-building","building-material"]', 4.5, 23
),
(
  'client-002', 'CH-RVS-100002', 'individual', 'approved',
  'Automobile', 'Nigeria', 'Rivers', 'Obio-Akpor', 'Rumuola', 'Rumuola', 'Rumuola',
  'Chuka Auto Works', '5 Chinda Street, Rumuola, Port Harcourt',
  'chukauto@gmail.com', '08098765432',
  'Rumuola Bus Stop', 'Total Filling Station',
  'Japanese Cars – Toyota, Honda, Lexus', '',
  'Expert mechanic with 10 years experience in Japanese vehicle repairs.',
  'Specializes in Toyota Camry, Corolla, Avalon, Lexus ES and RX models.',
  '[]', NULL, '[]', NULL, 'Chukwuemeka Okafor', '[]',
  2000, 6, 'interswitch', true,
  'ADM-PH-001', '2026-02-01T11:00:00Z', 'AGT-PH-005', '2026-01-28T10:00:00Z',
  '["automobile","automobile-spare-parts"]', 4.8, 47
),
(
  'client-003', 'CH-RVS-100003', 'corporate', 'pending',
  'Catering & Food', 'Nigeria', 'Rivers', 'Port Harcourt', 'Port Harcourt', 'D-Line', 'Port Harcourt',
  'Mama Titi Catering Services', '8 Aggrey Road, D-Line, Port Harcourt',
  'mamatiti@catering.ng', '08133334444',
  'D-Line Junction', 'Access Bank D-Line',
  'Outdoor Catering, Event Catering, Native Food', 'RC-9876543',
  'Professional catering outfit for events and corporate functions.',
  'Specializes in native soups, rice dishes, and full event catering for up to 1000 guests.',
  '[]', NULL, '[]', NULL, 'Titilayo Adebisi', '[]',
  5000, 6, 'paystack', true,
  NULL, NULL, 'AGT-PH-007', '2026-07-20T09:30:00Z',
  '["catering"]', NULL, 0
),
(
  'client-004', 'CH-LGS-200001', 'corporate', 'approved',
  'Retail (Supermarket/Store)', 'Nigeria', 'Lagos', 'Ikeja', 'Ikeja', 'Allen Avenue', 'Ikeja',
  'QuickMart Superstore', '45 Allen Avenue, Ikeja, Lagos',
  'info@quickmart.ng', '07011112222',
  'Allen Bus Stop', 'GTBank Allen Branch',
  'Supermarket, Groceries, Electronics', 'RC-5556789',
  'Full-service supermarket with fresh produce, household items, and electronics.',
  'New stock of electronics and household appliances available.',
  '[]', 'https://quickmart.ng',
  '[{"id":"s001","name":"Indomie Carton","price":4500,"description":"40-pack indomie carton","isOffer":true},{"id":"s002","name":"Semovita 1.5kg","price":750,"description":"Golden Penny Semovita","isOffer":false},{"id":"s003","name":"Rice 25kg","price":35000,"description":"Abakaliki long grain rice","isOffer":true}]',
  NULL, 'Mr. Adewale Johnson', '[]',
  10000, 12, 'paystack', true,
  'ADM-LG-001', '2026-03-10T10:00:00Z', 'AGT-LG-002', '2026-03-05T08:00:00Z',
  '["super-store"]', 4.2, 89
)
ON CONFLICT (id) DO NOTHING;
