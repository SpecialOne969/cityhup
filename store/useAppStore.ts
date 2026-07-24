import { create } from 'zustand';
import { Client, Admin, Complaint, SearchFilters } from '../types';
import { generateClientCode } from '../constants/locations';

interface AppState {
  // Auth
  currentAdmin: Admin | null;
  login: (code: string, password: string) => boolean;
  logout: () => void;

  // Clients
  clients: Client[];
  addClient: (data: Omit<Client, 'id' | 'clientCode' | 'status' | 'registeredAt'>) => Client;
  approveClient: (id: string, adminCode: string) => void;
  rejectClient: (id: string, adminCode: string, reason: string) => void;
  suspendClient: (id: string, adminCode: string, reason: string) => void;
  unsuspendClient: (id: string, adminCode: string) => void;
  markIndebted: (id: string, indebted: boolean) => void;
  getClientById: (id: string) => Client | undefined;
  getApprovedClients: () => Client[];
  getPendingClients: () => Client[];

  // Search
  searchFilters: SearchFilters;
  setSearchFilters: (filters: Partial<SearchFilters>) => void;
  searchResults: Client[];
  runSearch: () => void;

  // Complaints
  complaints: Complaint[];
  addComplaint: (data: Omit<Complaint, 'id' | 'status' | 'createdAt'>) => void;

  // Traffic
  trafficCount: number;
  incrementTraffic: () => void;
}

const MOCK_ADMINS: Admin[] = [
  {
    id: 'admin-001',
    adminCode: 'ADM-PH-001',
    name: 'Emmanuel Dike',
    email: 'e.dike@cityhup.com',
    city: 'Port Harcourt',
    state: 'Rivers',
    isActive: true,
    approvalCount: 12,
  },
  {
    id: 'admin-002',
    adminCode: 'ADM-LG-001',
    name: 'Chioma Obi',
    email: 'c.obi@cityhup.com',
    city: 'Lagos Island',
    state: 'Lagos',
    isActive: true,
    approvalCount: 34,
  },
];

const MOCK_CLIENTS: Client[] = [
  {
    id: 'client-001',
    clientCode: 'CH-RVS-100001',
    type: 'corporate',
    status: 'approved',
    natureOfBiz: 'Building & Construction',
    country: 'Nigeria',
    state: 'Rivers',
    lga: 'Port Harcourt',
    city: 'Port Harcourt',
    area: 'GRA Phase 2',
    town: 'Port Harcourt',
    businessName: 'Solvay Construction Ltd',
    address: '12 Tombia Street, GRA Phase 2, Port Harcourt',
    email: 'info@solvayconstruction.ng',
    phone: '08012345678',
    nearestBusStop: 'Rumuola Junction',
    nearestLandmark: 'Shell Camp',
    competence: 'Civil Engineering, Building, Renovation',
    cacNumber: 'RC-1234567',
    profile: 'We are a leading construction company based in Port Harcourt with over 15 years of experience in residential and commercial construction.',
    info: 'Specialized in high-rise buildings, estate development, and renovation works.',
    infoImages: [],
    websiteLink: 'https://solvayconstruction.ng',
    shelfItems: [],
    referral: 'City Hup Marketing Team',
    director: 'Engr. Solomon Diko',
    pictures: [],
    paymentBand: 10000,
    duration: 12,
    paymentMethod: 'paystack',
    acceptedTerms: true,
    approvedBy: 'ADM-PH-001',
    approvedAt: '2026-01-15T10:00:00Z',
    registeredBy: 'AGT-PH-005',
    registeredAt: '2026-01-10T09:00:00Z',
    categories: ['house-building', 'building-material'],
    rating: 4.5,
    reviewCount: 23,
  },
  {
    id: 'client-002',
    clientCode: 'CH-RVS-100002',
    type: 'individual',
    status: 'approved',
    natureOfBiz: 'Automobile',
    country: 'Nigeria',
    state: 'Rivers',
    lga: 'Obio-Akpor',
    city: 'Rumuola',
    area: 'Rumuola',
    town: 'Rumuola',
    businessName: 'Chuka Auto Works',
    address: '5 Chinda Street, Rumuola, Port Harcourt',
    email: 'chukauto@gmail.com',
    phone: '08098765432',
    nearestBusStop: 'Rumuola Bus Stop',
    nearestLandmark: 'Total Filling Station',
    competence: 'Japanese Cars – Toyota, Honda, Lexus',
    cacNumber: '',
    profile: 'Expert mechanic with 10 years experience in Japanese vehicle repairs.',
    info: 'Specializes in Toyota Camry, Corolla, Avalon, Lexus ES and RX models.',
    infoImages: [],
    shelfItems: [],
    director: 'Chukwuemeka Okafor',
    pictures: [],
    paymentBand: 2000,
    duration: 6,
    paymentMethod: 'interswitch',
    acceptedTerms: true,
    approvedBy: 'ADM-PH-001',
    approvedAt: '2026-02-01T11:00:00Z',
    registeredBy: 'AGT-PH-005',
    registeredAt: '2026-01-28T10:00:00Z',
    categories: ['automobile', 'automobile-spare-parts'],
    rating: 4.8,
    reviewCount: 47,
  },
  {
    id: 'client-003',
    clientCode: 'CH-RVS-100003',
    type: 'corporate',
    status: 'pending',
    natureOfBiz: 'Catering & Food',
    country: 'Nigeria',
    state: 'Rivers',
    lga: 'Port Harcourt',
    city: 'Port Harcourt',
    area: 'D-Line',
    town: 'Port Harcourt',
    businessName: 'Mama Titi Catering Services',
    address: '8 Aggrey Road, D-Line, Port Harcourt',
    email: 'mamatiti@catering.ng',
    phone: '08133334444',
    nearestBusStop: 'D-Line Junction',
    nearestLandmark: 'Access Bank D-Line',
    competence: 'Outdoor Catering, Event Catering, Native Food',
    cacNumber: 'RC-9876543',
    profile: 'Professional catering outfit for events and corporate functions.',
    info: 'Specializes in native soups, rice dishes, and full event catering for up to 1000 guests.',
    infoImages: [],
    shelfItems: [],
    director: 'Titilayo Adebisi',
    pictures: [],
    paymentBand: 5000,
    duration: 6,
    paymentMethod: 'paystack',
    acceptedTerms: true,
    registeredBy: 'AGT-PH-007',
    registeredAt: '2026-07-20T09:30:00Z',
    categories: ['catering'],
    rating: undefined,
    reviewCount: 0,
  },
  {
    id: 'client-004',
    clientCode: 'CH-LGS-200001',
    type: 'corporate',
    status: 'approved',
    natureOfBiz: 'Retail (Supermarket/Store)',
    country: 'Nigeria',
    state: 'Lagos',
    lga: 'Ikeja',
    city: 'Ikeja',
    area: 'Allen Avenue',
    town: 'Ikeja',
    businessName: 'QuickMart Superstore',
    address: '45 Allen Avenue, Ikeja, Lagos',
    email: 'info@quickmart.ng',
    phone: '07011112222',
    nearestBusStop: 'Allen Bus Stop',
    nearestLandmark: 'GTBank Allen Branch',
    competence: 'Supermarket, Groceries, Electronics',
    cacNumber: 'RC-5556789',
    profile: 'Full-service supermarket with fresh produce, household items, and electronics.',
    info: 'New stock of electronics and household appliances available.',
    infoImages: [],
    websiteLink: 'https://quickmart.ng',
    shelfItems: [
      { id: 's001', name: 'Indomie Carton', price: 4500, description: '40-pack indomie carton', isOffer: true },
      { id: 's002', name: 'Semovita 1.5kg', price: 750, description: 'Golden Penny Semovita', isOffer: false },
      { id: 's003', name: 'Rice 25kg', price: 35000, description: 'Abakaliki long grain rice', isOffer: true },
    ],
    director: 'Mr. Adewale Johnson',
    pictures: [],
    paymentBand: 10000,
    duration: 12,
    paymentMethod: 'paystack',
    acceptedTerms: true,
    approvedBy: 'ADM-LG-001',
    approvedAt: '2026-03-10T10:00:00Z',
    registeredBy: 'AGT-LG-002',
    registeredAt: '2026-03-05T08:00:00Z',
    categories: ['super-store'],
    rating: 4.2,
    reviewCount: 89,
  },
];

export const useAppStore = create<AppState>((set, get) => ({
  currentAdmin: null,

  login: (code: string, _password: string) => {
    const admin = MOCK_ADMINS.find(a => a.adminCode === code && a.isActive);
    if (admin) {
      set({ currentAdmin: admin });
      return true;
    }
    return false;
  },

  logout: () => set({ currentAdmin: null }),

  clients: MOCK_CLIENTS,

  addClient: (data) => {
    const newClient: Client = {
      ...data,
      id: `client-${Date.now()}`,
      clientCode: generateClientCode(data.state),
      status: 'pending',
      registeredAt: new Date().toISOString(),
    };
    set(state => ({ clients: [...state.clients, newClient] }));
    return newClient;
  },

  approveClient: (id, adminCode) => {
    set(state => ({
      clients: state.clients.map(c =>
        c.id === id
          ? { ...c, status: 'approved', approvedBy: adminCode, approvedAt: new Date().toISOString() }
          : c
      ),
    }));
  },

  rejectClient: (id, adminCode, reason) => {
    set(state => ({
      clients: state.clients.map(c =>
        c.id === id
          ? { ...c, status: 'rejected', approvedBy: adminCode, rejectedReason: reason, approvedAt: new Date().toISOString() }
          : c
      ),
    }));
  },

  suspendClient: (id, adminCode, reason) => {
    set(state => ({
      clients: state.clients.map(c =>
        c.id === id
          ? { ...c, status: 'suspended', approvedBy: adminCode, suspendedReason: reason }
          : c
      ),
    }));
  },

  unsuspendClient: (id, adminCode) => {
    set(state => ({
      clients: state.clients.map(c =>
        c.id === id
          ? { ...c, status: 'approved', suspendedReason: undefined, approvedBy: adminCode }
          : c
      ),
    }));
  },

  markIndebted: (id, indebted) => {
    set(state => ({
      clients: state.clients.map(c =>
        c.id === id ? { ...c, isIndebted: indebted } : c
      ),
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
  addComplaint: (data) => {
    const complaint: Complaint = {
      ...data,
      id: `complaint-${Date.now()}`,
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    set(state => ({ complaints: [...state.complaints, complaint] }));
  },

  trafficCount: 14872,
  incrementTraffic: () => set(state => ({ trafficCount: state.trafficCount + 1 })),
}));
