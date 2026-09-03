import { create } from 'zustand';
import { Client, Admin, Customer, Complaint, SearchFilters, Ad, Review } from '../types';
import { generateClientCode } from '../constants/locations';
import { Category, SubCategory, CATEGORIES, getLiveCategories, setDynamicCategories } from '../constants/categories';
import { supabase, dbToClient, clientToDb, dbToAdmin, dbToCustomer, dbToComplaint, dbToAd, dbToReview } from '../lib/supabase';

interface AppState {
  // Admin auth
  currentAdmin: Admin | null;
  login: (code: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  restoreSession: () => Promise<void>;

  // Client portal auth
  currentClient: Client | null;
  clientLogin: (email: string, password: string) => Promise<boolean>;
  clientLogout: () => Promise<void>;
  setupClientLogin: (email: string, password: string) => Promise<'ok' | 'no_listing' | 'error'>;
  updateClientProfile: (id: string, data: Partial<Client>) => Promise<void>;

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
  resolveComplaint: (id: string, status: 'reviewed' | 'resolved') => Promise<void>;

  reviews: Record<string, Review[]>;
  loadReviews: (clientId: string) => Promise<void>;
  addReview: (data: Omit<Review, 'id' | 'createdAt'>) => Promise<void>;

  trafficCount: number;
  incrementTraffic: () => void;

  // Dynamic categories (DB-backed)
  categories: Category[];
  categoriesLoaded: boolean;
  loadCategories: () => Promise<void>;
  seedCategoriesIfEmpty: () => Promise<void>;
  adminCreateCategory: (data: { label: string; icon: string; color: string; section: 'services' | 'goods'; imageUrl?: string }) => Promise<Category | null>;
  adminUpdateCategory: (id: string, data: { label?: string; icon?: string; color?: string; imageUrl?: string; isActive?: boolean }) => Promise<void>;
  adminDeleteCategory: (id: string) => Promise<void>;
  adminAddSubcategory: (categoryId: string, label: string) => Promise<SubCategory | null>;
  adminUpdateSubcategory: (categoryId: string, subId: string, label: string) => Promise<void>;
  adminDeleteSubcategory: (categoryId: string, subId: string) => Promise<void>;
  adminReorderCategory: (id: string, sortOrder: number) => Promise<void>;
}

async function hashPassword(password: string): Promise<string> {
  const data = new TextEncoder().encode(password);
  const hashBuf = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
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
    // Restore customer session from localStorage (no Supabase Auth for customers)
    if (typeof localStorage !== 'undefined') {
      const savedId = localStorage.getItem('ch_customer_id');
      if (savedId) {
        const { data: customerRow } = await supabase
          .from('customers').select('*').eq('id', savedId).maybeSingle();
        if (customerRow) {
          set({ currentCustomer: dbToCustomer(customerRow) });
        } else {
          localStorage.removeItem('ch_customer_id');
        }
      }
    }

    // Restore admin / client session from Supabase Auth
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: adminRow } = await supabase
        .from('admins').select('*').eq('id', session.user.id).maybeSingle();
      if (adminRow) {
        set({ currentAdmin: dbToAdmin(adminRow) });
        await get().loadComplaints();
      } else {
        const email = session.user.email;
        if (email) {
          const { data: clientRow } = await supabase
            .from('clients').select('*').eq('email', email).maybeSingle();
          if (clientRow) set({ currentClient: dbToClient(clientRow) });
        }
      }
    }

    await get().loadClients();
  },

  currentClient: null,

  clientLogin: async (email, password) => {
    const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !authData.user) return false;
    const { data: row } = await supabase
      .from('clients').select('*').eq('email', email).maybeSingle();
    if (!row) { await supabase.auth.signOut(); return false; }
    set({ currentClient: dbToClient(row) });
    return true;
  },

  clientLogout: async () => {
    await supabase.auth.signOut();
    set({ currentClient: null });
  },

  setupClientLogin: async (email, password) => {
    const { data: clientRow } = await supabase
      .from('clients').select('id').eq('email', email).maybeSingle();
    if (!clientRow) return 'no_listing';
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return 'error';
    // Sign in immediately (email confirm disabled in Supabase dashboard)
    const { data: authData } = await supabase.auth.signInWithPassword({ email, password });
    if (authData.user) {
      const { data: row } = await supabase
        .from('clients').select('*').eq('email', email).maybeSingle();
      if (row) set({ currentClient: dbToClient(row) });
    }
    return 'ok';
  },

  updateClientProfile: async (id, data) => {
    const row = clientToDb(data);
    const { data: updated } = await supabase
      .from('clients').update(row).eq('id', id).select().single();
    if (updated) {
      set(state => ({
        clients: state.clients.map(c => c.id === id ? dbToClient(updated) : c),
        currentClient: state.currentClient?.id === id ? dbToClient(updated) : state.currentClient,
      }));
    }
  },

  currentCustomer: null,

  customerLogin: async (email, password) => {
    const { data: row } = await supabase
      .from('customers').select('*').eq('email', email.toLowerCase()).maybeSingle();
    if (!row) return false;
    const hash = await hashPassword(password);
    if (row.password_hash !== hash) return false;
    const customer = dbToCustomer(row);
    set({ currentCustomer: customer });
    if (typeof localStorage !== 'undefined') localStorage.setItem('ch_customer_id', row.id);
    return true;
  },

  customerLogout: async () => {
    set({ currentCustomer: null });
    if (typeof localStorage !== 'undefined') localStorage.removeItem('ch_customer_id');
  },

  registerCustomer: async ({ fullName, email, phone, state, lga, interestedCategories, password }) => {
    const normalizedEmail = email.trim().toLowerCase();
    const { data: existing } = await supabase
      .from('customers').select('id').eq('email', normalizedEmail).maybeSingle();
    if (existing) return false;

    const id = crypto.randomUUID();
    const passwordHash = await hashPassword(password);

    const { error } = await supabase.from('customers').insert({
      id,
      full_name: fullName,
      email: normalizedEmail,
      phone: phone ?? null,
      state: state ?? null,
      lga: lga ?? null,
      interested_categories: interestedCategories,
      registered_at: new Date().toISOString(),
      password_hash: passwordHash,
    });
    if (error) return false;

    const { data: row } = await supabase.from('customers').select('*').eq('id', id).single();
    if (row) {
      set({ currentCustomer: dbToCustomer(row) });
      if (typeof localStorage !== 'undefined') localStorage.setItem('ch_customer_id', id);
    }
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
    get().loadCategories(); // non-blocking
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
    const { query, country, state, lga, city, category, section } = searchFilters;
    const q = query.toLowerCase();
    const sectionIds = section
      ? new Set(getLiveCategories().filter(cat => cat.section === section).map(cat => cat.id))
      : null;
    const results = approved.filter(c => {
      const matchQuery =
        !q ||
        c.businessName.toLowerCase().includes(q) ||
        c.competence.toLowerCase().includes(q) ||
        c.profile.toLowerCase().includes(q) ||
        c.natureOfBiz.toLowerCase().includes(q) ||
        c.categories.some(cat => cat.toLowerCase().includes(q));
      const matchCountry = !country || c.country === country;
      const matchState = !state || c.state === state;
      const matchLga = !lga || c.lga === lga;
      const matchCity = !city || c.city.toLowerCase().includes(city.toLowerCase());
      const matchCategory = !category || c.categories.includes(category);
      const matchSection = !sectionIds || c.categories.some(id => sectionIds.has(id));
      return matchQuery && matchCountry && matchState && matchLga && matchCity && matchCategory && matchSection;
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

  resolveComplaint: async (id, status) => {
    const { data } = await supabase
      .from('complaints')
      .update({ status, reviewed_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (data) set(state => ({ complaints: state.complaints.map(c => c.id === id ? dbToComplaint(data) : c) }));
  },

  reviews: {},

  loadReviews: async (clientId) => {
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });
    set(state => ({
      reviews: { ...state.reviews, [clientId]: (data ?? []).map(dbToReview) },
    }));
  },

  addReview: async ({ clientId, reviewerName, reviewerEmail, rating, comment }) => {
    const { data: inserted, error } = await supabase
      .from('reviews')
      .insert({
        client_id: clientId,
        reviewer_name: reviewerName,
        reviewer_email: reviewerEmail ?? null,
        rating,
        comment: comment ?? null,
      })
      .select()
      .single();
    if (error || !inserted) throw new Error(error?.message ?? 'Failed to submit review');
    const review = dbToReview(inserted);
    set(state => {
      const existing = state.reviews[clientId] ?? [];
      const updated = [review, ...existing];
      const avgRating = updated.reduce((s, r) => s + r.rating, 0) / updated.length;
      supabase.from('clients').update({
        rating: Math.round(avgRating * 10) / 10,
        review_count: updated.length,
      }).eq('id', clientId).then(() => {});
      return {
        reviews: { ...state.reviews, [clientId]: updated },
        clients: state.clients.map(c =>
          c.id === clientId
            ? { ...c, rating: Math.round(avgRating * 10) / 10, reviewCount: updated.length }
            : c
        ),
      };
    });
  },

  trafficCount: 14872,
  incrementTraffic: () => set(state => ({ trafficCount: state.trafficCount + 1 })),

  // ── Dynamic categories ────────────────────────────────────────────────────
  categories: [],
  categoriesLoaded: false,

  loadCategories: async () => {
    try {
      const { data: cats, error } = await supabase
        .from('categories')
        .select('id, label, icon, color, section, sort_order, image_url, is_active')
        .order('sort_order', { ascending: true });

      if (error) { return; } // table not created yet — static fallback

      const { data: subs } = await supabase
        .from('subcategories')
        .select('id, category_id, label, sort_order')
        .order('sort_order', { ascending: true });

      if (!cats || cats.length === 0) {
        await get().seedCategoriesIfEmpty();
        return;
      }

      const subMap: Record<string, SubCategory[]> = {};
      (subs ?? []).forEach((s: any) => {
        if (!subMap[s.category_id]) subMap[s.category_id] = [];
        subMap[s.category_id].push({ id: s.id, label: s.label });
      });

      const categories: Category[] = cats.map((c: any) => ({
        id: c.id, label: c.label, icon: c.icon, color: c.color,
        section: c.section, imageUrl: c.image_url, isActive: c.is_active,
        sortOrder: c.sort_order, subcategories: subMap[c.id] ?? [],
      }));

      set({ categories, categoriesLoaded: true });
      setDynamicCategories(categories);
    } catch { /* silently fall back to static */ }
  },

  seedCategoriesIfEmpty: async () => {
    const staticCats = CATEGORIES;
    for (let i = 0; i < staticCats.length; i++) {
      const cat = staticCats[i];
      await supabase.from('categories').upsert({
        id: cat.id, label: cat.label, icon: cat.icon, color: cat.color,
        section: cat.section, sort_order: i, is_active: true,
      }, { onConflict: 'id' });
      for (let j = 0; j < cat.subcategories.length; j++) {
        const sub = cat.subcategories[j];
        await supabase.from('subcategories').upsert({
          id: sub.id, category_id: cat.id, label: sub.label, sort_order: j,
        }, { onConflict: 'id' });
      }
    }
    await get().loadCategories();
  },

  adminCreateCategory: async (data) => {
    const id = data.label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + '-' + Date.now().toString(36);
    const sortOrder = get().categories.length;
    const { data: inserted, error } = await supabase.from('categories').insert({
      id, label: data.label, icon: data.icon, color: data.color,
      section: data.section, image_url: data.imageUrl ?? null, sort_order: sortOrder, is_active: true,
    }).select().single();
    if (error || !inserted) return null;
    const newCat: Category = { id, ...data, subcategories: [], isActive: true, sortOrder };
    set(state => {
      const cats = [...state.categories, newCat];
      setDynamicCategories(cats);
      return { categories: cats };
    });
    return newCat;
  },

  adminUpdateCategory: async (id, data) => {
    const row: any = {};
    if (data.label !== undefined) row.label = data.label;
    if (data.icon !== undefined) row.icon = data.icon;
    if (data.color !== undefined) row.color = data.color;
    if (data.imageUrl !== undefined) row.image_url = data.imageUrl;
    if (data.isActive !== undefined) row.is_active = data.isActive;
    await supabase.from('categories').update(row).eq('id', id);
    set(state => {
      const cats = state.categories.map(c => c.id === id ? { ...c, ...data } : c);
      setDynamicCategories(cats);
      return { categories: cats };
    });
  },

  adminDeleteCategory: async (id) => {
    await supabase.from('categories').delete().eq('id', id);
    set(state => {
      const cats = state.categories.filter(c => c.id !== id);
      setDynamicCategories(cats);
      return { categories: cats };
    });
  },

  adminAddSubcategory: async (categoryId, label) => {
    const id = categoryId + '-' + label.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString(36);
    const sortOrder = (get().categories.find(c => c.id === categoryId)?.subcategories.length ?? 0);
    const { data: inserted, error } = await supabase.from('subcategories').insert({
      id, category_id: categoryId, label, sort_order: sortOrder,
    }).select().single();
    if (error || !inserted) return null;
    const sub: SubCategory = { id, label };
    set(state => {
      const cats = state.categories.map(c =>
        c.id === categoryId ? { ...c, subcategories: [...c.subcategories, sub] } : c
      );
      setDynamicCategories(cats);
      return { categories: cats };
    });
    return sub;
  },

  adminUpdateSubcategory: async (categoryId, subId, label) => {
    await supabase.from('subcategories').update({ label }).eq('id', subId);
    set(state => {
      const cats = state.categories.map(c =>
        c.id === categoryId
          ? { ...c, subcategories: c.subcategories.map(s => s.id === subId ? { ...s, label } : s) }
          : c
      );
      setDynamicCategories(cats);
      return { categories: cats };
    });
  },

  adminDeleteSubcategory: async (categoryId, subId) => {
    await supabase.from('subcategories').delete().eq('id', subId);
    set(state => {
      const cats = state.categories.map(c =>
        c.id === categoryId
          ? { ...c, subcategories: c.subcategories.filter(s => s.id !== subId) }
          : c
      );
      setDynamicCategories(cats);
      return { categories: cats };
    });
  },

  adminReorderCategory: async (id, sortOrder) => {
    await supabase.from('categories').update({ sort_order: sortOrder }).eq('id', id);
    set(state => {
      const cats = state.categories.map(c => c.id === id ? { ...c, sortOrder } : c);
      setDynamicCategories(cats);
      return { categories: cats };
    });
  },
}));
