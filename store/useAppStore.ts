import { create } from 'zustand';
import { Client, Admin, Customer, Complaint, SearchFilters, Ad } from '../types';
import { generateClientCode } from '../constants/locations';
import { supabase, dbToClient, clientToDb, dbToAdmin, dbToCustomer, dbToComplaint, dbToAd } from '../lib/supabase';

interface AppState {
  // Admin auth
  currentAdmin: Admin | null;
  login: (code: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;

  // Customer auth
  currentCustomer: Customer | null;
  customerLogin: (email: string, password: string) => Promise<boolean>;
  customerLogout: () => Promise<void>;
  registerCustomer: (data: { fullName: string; email: string; phone?: string; state?: string; lga?: string; interestedCategories: string[]; password: string }) => Promise<boolean>;

  clients: Client[];
  isLoading: boolean;
  loadClients: () => Promise<void>;
  addClient: (data: Omit<Client, 'id' | 'clientCode' | 'status' | 'registeredAt'>) => Promise<Client>;
  approveClient: (id: string, adminCode: string) => Promise<void>;
  rejectClient: (id: string, adminCode: string, reason: string) => Promise<void>;
  suspendClient: (id: string, adminCode: string, reason: string) => Promise<void>;
  unsuspendClient: (id: string, adminCode: string) => Promise<void>;
  markIndebted: (id: string, indebted: boolean) => Promise<void>;
  setPremium: (id: string, isPremium: boolean) => Promise<void>;
  getClientById: (id: string) => Client | undefined;
  getApprovedClients: () => Client[];
  getPendingClients: () => Client[];

  ads: Ad[];
  loadAds: () => Promise<void>;
  createAd: (data: Omit<Ad, 'id' | 'createdAt'>) => Promise<void>;
  toggleAd: (id: string, isActive: boolean) => Promise<void>;
  deleteAd: (id: string) => Promise<void>;
  getAdsForState: (state?: string) => Ad[];

  searchFilters: SearchFilters;
  setSearchFilters: (filters: Partial<SearchFilters>) => void;
  searchResults: Client[];
  runSearch: () => void;

  complaints: Complaint[];
  loadComplaints: () => Promise<void>;
  addComplaint: (data: Omit<Complaint, 'id' | 'status' | 'createdAt'>) => Promise<void>;

  trafficCount: number;
  incrementTraffic: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentAdmin: null,

  login: async (code, password) => {
    const { data: adminRow } = await supabase
      .from('admins')
      .select('email')
      .eq('admin_code', code)
      .eq('is_active', true)
      .maybeSingle();

    if (!adminRow) return false;

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: adminRow.email,
      password,
    });

    if (error || !authData.user) return false;

    const { data: admin } = await supabase
      .from('admins')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (!admin) return false;

    set({ currentAdmin: dbToAdmin(admin) });
    await get().loadClients();
    await get().loadComplaints();
    return true;
  },

  logout: async () => {
    await supabase.auth.signOut();
    set({ currentAdmin: null, complaints: [] });
    await get().loadClients();
  },

  restoreSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      await get().loadClients();
      return;
    }
    const { data: adminRow } = await supabase
      .from('admins')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

    if (adminRow) {
      set({ currentAdmin: dbToAdmin(adminRow) });
      await get().loadComplaints();
    } else {
      const { data: customerRow } = await supabase
        .from('customers')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();
      if (customerRow) set({ currentCustomer: dbToCustomer(customerRow) });
    }
    await get().loadClients();
  },

  currentCustomer: null,

  customerLogin: async (email, password) => {
    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !authData.user) return false;
    const { data: row } = await supabase.from('customers').select('*').eq('id', authData.user.id).single();
    if (!row) { await supabase.auth.signOut(); return false; }
    set({ currentCustomer: dbToCustomer(row) });
    return true;
  },

  customerLogout: async () => {
    await supabase.auth.signOut();
    set({ currentCustomer: null });
  },

  registerCustomer: async ({ fullName, email, phone, state, lga, interestedCategories, password }) => {
    const { data: authData, error } = await supabase.auth.signUp({ email, password });
    if (error || !authData.user) return false;
    const { error: insertError } = await supabase.from('customers').insert({
      id: authData.user.id,
      full_name: fullName,
      email,
      phone: phone ?? null,
      state: state ?? null,
      lga: lga ?? null,
      interested_categories: interestedCategories,
    });
    if (insertError) return false;
    const { data: row } = await supabase.from('customers').select('*').eq('id', authData.user.id).single();
    if (row) set({ currentCustomer: dbToCustomer(row) });
    return true;
  },

  clients: [],
  isLoading: false,

  loadClients: async () => {
    set({ isLoading: true });
    const { data } = await supabase
      .from('clients')
      .select('*')
      .order('registered_at', { ascending: false });
    set({ clients: (data ?? []).map(dbToClient), isLoading: false });
    await get().loadAds();
  },

  addClient: async (data) => {
    const clientCode = generateClientCode(data.state);
    const row = clientToDb({
      ...data,
      clientCode,
      status: 'pending',
      registeredAt: new Date().toISOString(),
    });

    const { data: inserted, error } = await supabase
      .from('clients')
      .insert(row)
      .select()
      .single();

    if (error || !inserted) throw new Error(error?.message ?? 'Registration failed');

    const client = dbToClient(inserted);
    set(state => ({ clients: [client, ...state.clients] }));
    return client;
  },

  approveClient: async (id, adminCode) => {
    const now = new Date().toISOString();
    await supabase
      .from('clients')
      .update({ status: 'approved', approved_by: adminCode, approved_at: now })
      .eq('id', id);
    set(state => ({
      clients: state.clients.map(c =>
        c.id === id ? { ...c, status: 'approved', approvedBy: adminCode, approvedAt: now } : c
      ),
    }));
  },

  rejectClient: async (id, adminCode, reason) => {
    const now = new Date().toISOString();
    await supabase
      .from('clients')
      .update({ status: 'rejected', approved_by: adminCode, rejected_reason: reason, approved_at: now })
      .eq('id', id);
    set(state => ({
      clients: state.clients.map(c =>
        c.id === id ? { ...c, status: 'rejected', approvedBy: adminCode, rejectedReason: reason, approvedAt: now } : c
      ),
    }));
  },

  suspendClient: async (id, adminCode, reason) => {
    await supabase
      .from('clients')
      .update({ status: 'suspended', approved_by: adminCode, suspended_reason: reason })
      .eq('id', id);
    set(state => ({
      clients: state.clients.map(c =>
        c.id === id ? { ...c, status: 'suspended', approvedBy: adminCode, suspendedReason: reason } : c
      ),
    }));
  },

  unsuspendClient: async (id, adminCode) => {
    await supabase
      .from('clients')
      .update({ status: 'approved', suspended_reason: null, approved_by: adminCode })
      .eq('id', id);
    set(state => ({
      clients: state.clients.map(c =>
        c.id === id ? { ...c, status: 'approved', suspendedReason: undefined, approvedBy: adminCode } : c
      ),
    }));
  },

  markIndebted: async (id, indebted) => {
    await supabase.from('clients').update({ is_indebted: indebted }).eq('id', id);
    set(state => ({
      clients: state.clients.map(c => c.id === id ? { ...c, isIndebted: indebted } : c),
    }));
  },

  setPremium: async (id, isPremium) => {
    await supabase.from('clients').update({ is_premium: isPremium }).eq('id', id);
    set(state => ({
      clients: state.clients.map(c => c.id === id ? { ...c, isPremium } : c),
    }));
  },

  getClientById: (id) => get().clients.find(c => c.id === id),
  getApprovedClients: () => get().clients.filter(c => c.status === 'approved'),
  getPendingClients: () => get().clients.filter(c => c.status === 'pending'),

  ads: [],

  loadAds: async () => {
    const { data } = await supabase
      .from('ads')
      .select('*')
      .order('priority', { ascending: false })
      .order('created_at', { ascending: false });
    set({ ads: (data ?? []).map(dbToAd) });
  },

  createAd: async (data) => {
    const { data: inserted, error } = await supabase
      .from('ads')
      .insert({
        title: data.title,
        subtitle: data.subtitle ?? null,
        image_url: data.imageUrl ?? null,
        bg_color: data.bgColor,
        icon: data.icon,
        link_type: data.linkType,
        link_url: data.linkUrl ?? null,
        link_client_id: data.linkClientId ?? null,
        target_state: data.targetState ?? null,
        is_active: data.isActive,
        priority: data.priority,
        expires_at: data.expiresAt ?? null,
      })
      .select()
      .single();
    if (error || !inserted) throw new Error(error?.message ?? 'Failed to create ad');
    set(state => ({ ads: [dbToAd(inserted), ...state.ads] }));
  },

  toggleAd: async (id, isActive) => {
    await supabase.from('ads').update({ is_active: isActive }).eq('id', id);
    set(state => ({
      ads: state.ads.map(a => a.id === id ? { ...a, isActive } : a),
    }));
  },

  deleteAd: async (id) => {
    await supabase.from('ads').delete().eq('id', id);
    set(state => ({ ads: state.ads.filter(a => a.id !== id) }));
  },

  getAdsForState: (state) => {
    const { ads } = get();
    return ads.filter(a =>
      a.isActive && (!a.targetState || !state || a.targetState === state)
    );
  },

  searchFilters: { query: '' },
  setSearchFilters: (filters) =>
    set(state => ({ searchFilters: { ...state.searchFilters, ...filters } })),

  searchResults: [],
  runSearch: () => {
    const { clients, searchFilters } = get();
    const approved = clients.filter(c => c.status === 'approved' && !c.isIndebted);
    const { query, state, lga, city, category } = searchFilters;
    const q = query.toLowerCase();
    const results = approved.filter(c => {
      const matchQuery =
        !q ||
        c.businessName.toLowerCase().includes(q) ||
        c.competence.toLowerCase().includes(q) ||
        c.profile.toLowerCase().includes(q) ||
        c.natureOfBiz.toLowerCase().includes(q) ||
        c.categories.some(cat => cat.toLowerCase().includes(q));
      const matchState = !state || c.state === state;
      const matchLga = !lga || c.lga === lga;
      const matchCity = !city || c.city.toLowerCase().includes(city.toLowerCase());
      const matchCategory = !category || c.categories.includes(category);
      return matchQuery && matchState && matchLga && matchCity && matchCategory;
    });
    // Premium clients always appear first
    results.sort((a, b) => (b.isPremium ? 1 : 0) - (a.isPremium ? 1 : 0));
    set({ searchResults: results });
  },

  complaints: [],

  loadComplaints: async () => {
    const { data } = await supabase
      .from('complaints')
      .select('*')
      .order('created_at', { ascending: false });
    set({ complaints: (data ?? []).map(dbToComplaint) });
  },

  addComplaint: async (data) => {
    const { data: inserted, error } = await supabase
      .from('complaints')
      .insert({
        client_id: data.clientId,
        reporter_name: data.reporterName,
        reporter_phone: data.reporterPhone,
        description: data.description,
        recommendation: data.recommendation ?? null,
        status: 'open',
      })
      .select()
      .single();

    if (error || !inserted) throw new Error(error?.message ?? 'Failed to submit complaint');

    const complaint = dbToComplaint(inserted);
    set(state => ({ complaints: [complaint, ...state.complaints] }));
  },

  trafficCount: 14872,
  incrementTraffic: () => set(state => ({ trafficCount: state.trafficCount + 1 })),
}));
