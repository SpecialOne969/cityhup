import { create } from 'zustand';
import { Client, Admin, Complaint, SearchFilters } from '../types';
import { generateClientCode } from '../constants/locations';
import { supabase, dbToClient, clientToDb, dbToAdmin, dbToComplaint } from '../lib/supabase';

interface AppState {
  currentAdmin: Admin | null;
  login: (code: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;

  clients: Client[];
  isLoading: boolean;
  loadClients: () => Promise<void>;
  addClient: (data: Omit<Client, 'id' | 'clientCode' | 'status' | 'registeredAt'>) => Promise<Client>;
  approveClient: (id: string, adminCode: string) => Promise<void>;
  rejectClient: (id: string, adminCode: string, reason: string) => Promise<void>;
  suspendClient: (id: string, adminCode: string, reason: string) => Promise<void>;
  unsuspendClient: (id: string, adminCode: string) => Promise<void>;
  markIndebted: (id: string, indebted: boolean) => Promise<void>;
  getClientById: (id: string) => Client | undefined;
  getApprovedClients: () => Client[];
  getPendingClients: () => Client[];

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
    const { data: admin } = await supabase
      .from('admins')
      .select('*')
      .eq('id', session.user.id)
      .maybeSingle();

    if (admin) {
      set({ currentAdmin: dbToAdmin(admin) });
      await get().loadComplaints();
    }
    await get().loadClients();
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

  getClientById: (id) => get().clients.find(c => c.id === id),
  getApprovedClients: () => get().clients.filter(c => c.status === 'approved'),
  getPendingClients: () => get().clients.filter(c => c.status === 'pending'),

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
