import React, { useState, useEffect, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  Platform, FlatList,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useAppStore } from '../../store/useAppStore';
import { Client, Complaint } from '../../types';

type MainTab = 'overview' | 'clients' | 'revenue' | 'complaints';
type ClientFilter = 'all' | 'pending' | 'approved' | 'suspended' | 'rejected' | 'indebted';
type ComplaintFilter = 'open' | 'reviewed' | 'resolved';

const COUNTRY_FLAGS: Record<string, string> = {
  Nigeria: '🇳🇬', Ghana: '🇬🇭', 'Benin Republic': '🇧🇯', Liberia: '🇱🇷',
};
const COUNTRIES = ['Nigeria', 'Ghana', 'Benin Republic', 'Liberia'];

export default function AdminDashboard() {
  const router = useRouter();
  const currentAdmin = useAppStore(s => s.currentAdmin);
  const clients = useAppStore(s => s.clients);
  const complaints = useAppStore(s => s.complaints);
  const logout = useAppStore(s => s.logout);
  const resolveComplaint = useAppStore(s => s.resolveComplaint);

  const [mainTab, setMainTab] = useState<MainTab>('overview');
  const [clientFilter, setClientFilter] = useState<ClientFilter>('all');
  const [clientSearch, setClientSearch] = useState('');
  const [complaintFilter, setComplaintFilter] = useState<ComplaintFilter>('open');

  useEffect(() => {
    if (!currentAdmin) router.replace('/admin/login');
  }, [currentAdmin]);

  if (!currentAdmin) return null;

  // --- Derived stats ---
  const pending   = useMemo(() => clients.filter(c => c.status === 'pending'), [clients]);
  const approved  = useMemo(() => clients.filter(c => c.status === 'approved'), [clients]);
  const suspended = useMemo(() => clients.filter(c => c.status === 'suspended'), [clients]);
  const rejected  = useMemo(() => clients.filter(c => c.status === 'rejected'), [clients]);
  const indebted  = useMemo(() => clients.filter(c => c.isIndebted), [clients]);
  const premium   = useMemo(() => clients.filter(c => c.isPremium), [clients]);
  const total     = clients.length;

  const byCountry = useMemo(() =>
    COUNTRIES.map(name => ({ name, count: clients.filter(c => c.country === name).length })),
    [clients]);

  const corporate = useMemo(() => clients.filter(c => c.type === 'corporate').length, [clients]);
  const individual = total - corporate;

  const topStates = useMemo(() => {
    const m: Record<string, number> = {};
    clients.forEach(c => { if (c.state) m[c.state] = (m[c.state] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 6);
  }, [clients]);

  const topAgents = useMemo(() => {
    const m: Record<string, number> = {};
    clients.forEach(c => { if (c.registeredBy) m[c.registeredBy] = (m[c.registeredBy] || 0) + 1; });
    return Object.entries(m).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [clients]);

  const recentClients = useMemo(() =>
    [...clients].sort((a, b) => new Date(b.registeredAt).getTime() - new Date(a.registeredAt).getTime()).slice(0, 5),
    [clients]);

  const expiringSoon = useMemo(() => {
    const now = new Date();
    const in30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return approved.filter(c => {
      if (!c.subscriptionExpiry) return false;
      const d = new Date(c.subscriptionExpiry);
      return d >= now && d <= in30;
    });
  }, [approved]);

  // --- Revenue ---
  const totalRevenue = useMemo(() =>
    approved.reduce((s, c) => s + (c.paymentBand || 0), 0), [approved]);

  const byPaymentMethod = useMemo(() =>
    (['interswitch', 'remita', 'paystack'] as const).map(m => ({
      label: m.charAt(0).toUpperCase() + m.slice(1),
      count: clients.filter(c => c.paymentMethod === m).length,
    })),
    [clients]);

  const byDuration = useMemo(() => {
    const m: Record<number, number> = {};
    clients.forEach(c => { if (c.duration) m[c.duration] = (m[c.duration] || 0) + 1; });
    return Object.entries(m).sort((a, b) => Number(a[0]) - Number(b[0])).map(([d, n]) => ({ duration: Number(d), count: n }));
  }, [clients]);

  // --- Clients list ---
  const filteredClients = useMemo(() => {
    let list = clients;
    if (clientFilter === 'pending')   list = pending;
    else if (clientFilter === 'approved')  list = approved;
    else if (clientFilter === 'suspended') list = suspended;
    else if (clientFilter === 'rejected')  list = rejected;
    else if (clientFilter === 'indebted')  list = indebted;
    if (clientSearch.trim()) {
      const q = clientSearch.toLowerCase();
      list = list.filter(c =>
        c.businessName.toLowerCase().includes(q) ||
        c.clientCode.toLowerCase().includes(q) ||
        c.state?.toLowerCase().includes(q) ||
        c.phone?.toLowerCase().includes(q));
    }
    return list;
  }, [clients, clientFilter, clientSearch, pending, approved, suspended, rejected, indebted]);

  // --- Complaints list ---
  const filteredComplaints = useMemo(() =>
    complaints.filter(c => c.status === complaintFilter),
    [complaints, complaintFilter]);

  async function handleLogout() {
    await logout();
    router.replace('/');
  }

  const openComplaints = complaints.filter(c => c.status === 'open').length;

  return (
    <View style={styles.root}>
      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/')} style={styles.headerIconBtn}>
          <Ionicons name="home-outline" size={20} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <Text style={styles.headerSub}>{currentAdmin.name} · {currentAdmin.adminCode}</Text>
        </View>
        {openComplaints > 0 && (
          <View style={styles.alertBadge}>
            <Ionicons name="warning" size={14} color={Colors.white} />
            <Text style={styles.alertBadgeText}>{openComplaints}</Text>
          </View>
        )}
        <TouchableOpacity onPress={handleLogout} style={styles.headerIconBtn}>
          <Ionicons name="log-out-outline" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* ── Main tabs ── */}
      <View style={styles.mainTabs}>
        {([
          { key: 'overview',   icon: 'grid-outline',         label: 'Overview' },
          { key: 'clients',    icon: 'people-outline',       label: 'Clients' },
          { key: 'revenue',    icon: 'cash-outline',         label: 'Revenue' },
          { key: 'complaints', icon: 'alert-circle-outline', label: 'Alerts' },
        ] as { key: MainTab; icon: string; label: string }[]).map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.mainTab, mainTab === t.key && styles.mainTabActive]}
            onPress={() => setMainTab(t.key)}
          >
            <Ionicons name={t.icon as any} size={18} color={mainTab === t.key ? Colors.primary : Colors.textLight} />
            <Text style={[styles.mainTabText, mainTab === t.key && styles.mainTabTextActive]}>{t.label}</Text>
            {t.key === 'complaints' && openComplaints > 0 && (
              <View style={styles.tabDot}><Text style={styles.tabDotText}>{openComplaints}</Text></View>
            )}
            {t.key === 'clients' && pending.length > 0 && (
              <View style={[styles.tabDot, { backgroundColor: Colors.warning }]}>
                <Text style={styles.tabDotText}>{pending.length}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Content ── */}
      {mainTab === 'overview' && (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* KPI row */}
          <View style={styles.kpiRow}>
            <KpiCard label="Total" value={total} icon="business-outline" color={Colors.primary} />
            <KpiCard label="Active" value={approved.length} icon="checkmark-circle" color={Colors.success} />
            <KpiCard label="Pending" value={pending.length} icon="time" color={Colors.warning} />
            <KpiCard label="Issues" value={suspended.length + indebted.length} icon="alert-circle" color={Colors.danger} />
          </View>

          {/* Status health bar */}
          <SectionCard title="Platform Status" icon="pulse-outline">
            <View style={styles.healthBar}>
              {approved.length > 0  && <View style={[styles.healthSeg, { flex: approved.length,  backgroundColor: Colors.success }]} />}
              {pending.length > 0   && <View style={[styles.healthSeg, { flex: pending.length,   backgroundColor: Colors.warning }]} />}
              {suspended.length > 0 && <View style={[styles.healthSeg, { flex: suspended.length, backgroundColor: Colors.danger }]} />}
              {rejected.length > 0  && <View style={[styles.healthSeg, { flex: Math.max(rejected.length, 0.5),  backgroundColor: Colors.textMuted }]} />}
            </View>
            <View style={styles.healthLegend}>
              <LegendDot color={Colors.success} label={`Active (${approved.length})`} />
              <LegendDot color={Colors.warning} label={`Pending (${pending.length})`} />
              <LegendDot color={Colors.danger}  label={`Suspended (${suspended.length})`} />
              <LegendDot color={Colors.textMuted} label={`Rejected (${rejected.length})`} />
            </View>
            <View style={styles.healthRow}>
              <HealthChip icon="star" color={Colors.gold} label={`${premium.length} Premium`} />
              <HealthChip icon="warning" color={Colors.danger} label={`${indebted.length} Indebted`} />
              <HealthChip icon="time" color={Colors.info} label={`${expiringSoon.length} Expiring`} />
            </View>
          </SectionCard>

          {/* By Country */}
          <SectionCard title="By Country" icon="globe-outline">
            {byCountry.map(({ name, count }) => (
              <BarRow key={name} label={`${COUNTRY_FLAGS[name] ?? ''} ${name}`} count={count} total={Math.max(total, 1)} color={Colors.primary} />
            ))}
          </SectionCard>

          {/* By Type */}
          <SectionCard title="Business Type" icon="business-outline">
            <View style={styles.splitBar}>
              {corporate > 0   && <View style={[styles.splitSeg, { flex: corporate,  backgroundColor: Colors.primary }]}><Text style={styles.splitLabel}>Corporate {corporate}</Text></View>}
              {individual > 0  && <View style={[styles.splitSeg, { flex: individual, backgroundColor: Colors.accent }]}><Text style={styles.splitLabel}>Individual {individual}</Text></View>}
            </View>
          </SectionCard>

          {/* Top States */}
          {topStates.length > 0 && (
            <SectionCard title="Top States" icon="map-outline">
              {topStates.map(([state, count]) => (
                <BarRow key={state} label={state} count={count} total={Math.max(topStates[0][1], 1)} color={Colors.info} />
              ))}
            </SectionCard>
          )}

          {/* Top Agents */}
          {topAgents.length > 0 && (
            <SectionCard title="Top Agents by Registrations" icon="person-outline">
              {topAgents.map(([code, count], i) => (
                <View key={code} style={styles.agentRow}>
                  <View style={[styles.agentRank, i === 0 && { backgroundColor: Colors.gold }]}>
                    <Text style={styles.agentRankText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.agentCode}>{code}</Text>
                  <View style={styles.agentBarWrap}>
                    <View style={[styles.agentBar, { flex: count }]} />
                    <View style={{ flex: Math.max(topAgents[0][1] - count, 0.01) }} />
                  </View>
                  <Text style={styles.agentCount}>{count}</Text>
                </View>
              ))}
            </SectionCard>
          )}

          {/* Expiring Soon */}
          {expiringSoon.length > 0 && (
            <SectionCard title="Subscriptions Expiring (30 days)" icon="alarm-outline">
              {expiringSoon.map(c => (
                <TouchableOpacity key={c.id} style={styles.expiryRow}
                  onPress={() => router.push({ pathname: '/admin/approve/[id]', params: { id: c.id } })}>
                  <View style={styles.expiryLeft}>
                    <Text style={styles.expiryName}>{c.businessName}</Text>
                    <Text style={styles.expirySub}>{c.clientCode} · {c.state}</Text>
                  </View>
                  <View style={styles.expiryDateBox}>
                    <Text style={styles.expiryDate}>{c.subscriptionExpiry ? new Date(c.subscriptionExpiry).toLocaleDateString() : '—'}</Text>
                    <Ionicons name="chevron-forward" size={14} color={Colors.danger} />
                  </View>
                </TouchableOpacity>
              ))}
            </SectionCard>
          )}

          {/* Recent registrations */}
          <SectionCard title="Recent Registrations" icon="time-outline" action={{ label: 'View all', onPress: () => setMainTab('clients') }}>
            {recentClients.map(c => (
              <TouchableOpacity key={c.id} style={styles.recentRow}
                onPress={() => router.push({ pathname: '/admin/approve/[id]', params: { id: c.id } })}>
                <View style={[styles.statusDot, { backgroundColor: c.status === 'approved' ? Colors.success : c.status === 'pending' ? Colors.warning : Colors.danger }]} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.recentName}>{c.businessName}</Text>
                  <Text style={styles.recentSub}>{c.state} · {new Date(c.registeredAt).toLocaleDateString()}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
              </TouchableOpacity>
            ))}
          </SectionCard>

          {/* Quick actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.qaBtn} onPress={() => router.push('/admin/ads')}>
              <Ionicons name="megaphone-outline" size={22} color={Colors.primary} />
              <Text style={styles.qaBtnText}>Manage Ads</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.qaBtn} onPress={() => router.push('/register' as any)}>
              <Ionicons name="person-add-outline" size={22} color={Colors.success} />
              <Text style={styles.qaBtnText}>Register Client</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 30 }} />
        </ScrollView>
      )}

      {mainTab === 'clients' && (
        <View style={styles.flex1}>
          {/* Search */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={16} color={Colors.textLight} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search by name, code, state, phone…"
              value={clientSearch}
              onChangeText={setClientSearch}
              placeholderTextColor={Colors.textMuted}
            />
            {clientSearch.length > 0 && (
              <TouchableOpacity onPress={() => setClientSearch('')}>
                <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>
          {/* Filter chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll} contentContainerStyle={styles.filterChips}>
            {([
              { key: 'all',       label: `All (${total})`,           color: Colors.primary },
              { key: 'pending',   label: `Pending (${pending.length})`, color: Colors.warning },
              { key: 'approved',  label: `Approved (${approved.length})`, color: Colors.success },
              { key: 'suspended', label: `Suspended (${suspended.length})`, color: Colors.danger },
              { key: 'rejected',  label: `Rejected (${rejected.length})`,  color: Colors.textMuted },
              { key: 'indebted',  label: `Indebted (${indebted.length})`, color: Colors.accent },
            ] as { key: ClientFilter; label: string; color: string }[]).map(f => (
              <TouchableOpacity
                key={f.key}
                style={[styles.filterChip, clientFilter === f.key && { backgroundColor: f.color, borderColor: f.color }]}
                onPress={() => setClientFilter(f.key)}
              >
                <Text style={[styles.filterChipText, clientFilter === f.key && { color: Colors.white }]}>{f.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <FlatList
            data={filteredClients}
            keyExtractor={c => c.id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={<EmptyState label="No clients match this filter" />}
            renderItem={({ item }) => (
              <AdminClientCard
                client={item}
                onPress={() => router.push({ pathname: '/admin/approve/[id]', params: { id: item.id } })}
              />
            )}
          />
        </View>
      )}

      {mainTab === 'revenue' && (
        <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
          {/* Revenue headline */}
          <View style={styles.revenueHero}>
            <Text style={styles.revenueLabel}>Estimated Total Revenue</Text>
            <Text style={styles.revenueAmount}>₦{totalRevenue.toLocaleString()}</Text>
            <Text style={styles.revenueSub}>Based on payment bands of {approved.length} approved clients</Text>
          </View>

          {/* KPI row */}
          <View style={styles.kpiRow}>
            <KpiCard label="Active" value={approved.length} icon="checkmark-circle" color={Colors.success} />
            <KpiCard label="Premium" value={premium.length} icon="star" color={Colors.gold} />
            <KpiCard label="Indebted" value={indebted.length} icon="warning" color={Colors.danger} />
            <KpiCard label="Expiring" value={expiringSoon.length} icon="alarm" color={Colors.warning} />
          </View>

          {/* By Payment Method */}
          <SectionCard title="By Payment Method" icon="card-outline">
            {byPaymentMethod.map(({ label, count }) => (
              <BarRow key={label} label={label} count={count} total={Math.max(total, 1)} color={Colors.info} />
            ))}
          </SectionCard>

          {/* By Duration */}
          {byDuration.length > 0 && (
            <SectionCard title="By Subscription Duration" icon="calendar-outline">
              {byDuration.map(({ duration, count }) => (
                <BarRow key={duration}
                  label={`${duration} Year${duration > 1 ? 's' : ''}`}
                  count={count}
                  total={Math.max(total, 1)}
                  color={Colors.primary} />
              ))}
            </SectionCard>
          )}

          {/* Indebted clients */}
          {indebted.length > 0 && (
            <SectionCard title="Indebted Clients" icon="alert-circle-outline">
              {indebted.map(c => (
                <TouchableOpacity key={c.id} style={styles.recentRow}
                  onPress={() => router.push({ pathname: '/admin/approve/[id]', params: { id: c.id } })}>
                  <Ionicons name="warning" size={16} color={Colors.danger} />
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.recentName}>{c.businessName}</Text>
                    <Text style={styles.recentSub}>{c.clientCode} · {c.state}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
                </TouchableOpacity>
              ))}
            </SectionCard>
          )}

          {/* Expiring soon */}
          {expiringSoon.length > 0 && (
            <SectionCard title="Expiring Within 30 Days" icon="alarm-outline">
              {expiringSoon.map(c => (
                <TouchableOpacity key={c.id} style={styles.expiryRow}
                  onPress={() => router.push({ pathname: '/admin/approve/[id]', params: { id: c.id } })}>
                  <View style={styles.expiryLeft}>
                    <Text style={styles.expiryName}>{c.businessName}</Text>
                    <Text style={styles.expirySub}>{c.clientCode} · {c.state}</Text>
                  </View>
                  <View style={styles.expiryDateBox}>
                    <Text style={styles.expiryDate}>{c.subscriptionExpiry ? new Date(c.subscriptionExpiry).toLocaleDateString() : '—'}</Text>
                    <Ionicons name="chevron-forward" size={14} color={Colors.danger} />
                  </View>
                </TouchableOpacity>
              ))}
            </SectionCard>
          )}

          <View style={{ height: 30 }} />
        </ScrollView>
      )}

      {mainTab === 'complaints' && (
        <View style={styles.flex1}>
          {/* Status filter */}
          <View style={styles.filterScroll}>
            <View style={styles.filterChips}>
              {(['open', 'reviewed', 'resolved'] as ComplaintFilter[]).map(f => {
                const count = complaints.filter(c => c.status === f).length;
                const color = f === 'open' ? Colors.danger : f === 'reviewed' ? Colors.warning : Colors.success;
                return (
                  <TouchableOpacity
                    key={f}
                    style={[styles.filterChip, complaintFilter === f && { backgroundColor: color, borderColor: color }]}
                    onPress={() => setComplaintFilter(f)}
                  >
                    <Text style={[styles.filterChipText, complaintFilter === f && { color: Colors.white }]}>
                      {f.charAt(0).toUpperCase() + f.slice(1)} ({count})
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <FlatList
            data={filteredComplaints}
            keyExtractor={c => c.id}
            contentContainerStyle={styles.list}
            ListEmptyComponent={<EmptyState label={`No ${complaintFilter} complaints`} />}
            renderItem={({ item }) => (
              <ComplaintCard complaint={item} onResolve={resolveComplaint} />
            )}
          />
        </View>
      )}
    </View>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function KpiCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  return (
    <View style={[styles.kpiCard, { borderTopColor: color }]}>
      <Ionicons name={icon as any} size={20} color={color} />
      <Text style={[styles.kpiValue, { color }]}>{value}</Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
}

function SectionCard({ title, icon, children, action }: {
  title: string; icon: string; children: React.ReactNode;
  action?: { label: string; onPress: () => void };
}) {
  return (
    <View style={styles.sectionCard}>
      <View style={styles.sectionHeader}>
        <Ionicons name={icon as any} size={15} color={Colors.primary} />
        <Text style={styles.sectionTitle}>{title}</Text>
        {action && (
          <TouchableOpacity onPress={action.onPress}>
            <Text style={styles.sectionAction}>{action.label}</Text>
          </TouchableOpacity>
        )}
      </View>
      {children}
    </View>
  );
}

function BarRow({ label, count, total, color }: { label: string; count: number; total: number; color: string }) {
  const pct = total > 0 ? count / total : 0;
  return (
    <View style={styles.barRow}>
      <Text style={styles.barLabel}>{label}</Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { flex: Math.max(count, 0.01), backgroundColor: color }]} />
        <View style={{ flex: Math.max(total - count, 0.01) }} />
      </View>
      <Text style={styles.barCount}>{count}</Text>
    </View>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendDot}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

function HealthChip({ icon, color, label }: { icon: string; color: string; label: string }) {
  return (
    <View style={[styles.healthChip, { borderColor: color }]}>
      <Ionicons name={icon as any} size={13} color={color} />
      <Text style={[styles.healthChipText, { color }]}>{label}</Text>
    </View>
  );
}

function AdminClientCard({ client, onPress }: { client: Client; onPress: () => void }) {
  const statusColor = client.status === 'approved' ? Colors.success : client.status === 'pending' ? Colors.warning : Colors.danger;
  const statusBg = client.status === 'approved' ? Colors.successLight : client.status === 'pending' ? Colors.warningLight : Colors.dangerLight;
  return (
    <TouchableOpacity style={styles.clientCard} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.clientCardTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.clientName}>{client.businessName}</Text>
          <Text style={styles.clientCode}>{client.clientCode}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusBg }]}>
          <Text style={[styles.statusBadgeText, { color: statusColor }]}>{client.status.toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.clientMeta}>
        <Ionicons name="location-outline" size={12} color={Colors.textLight} />
        <Text style={styles.clientMetaText}>{client.area}, {client.city}, {client.state}</Text>
        <Text style={styles.dot}>·</Text>
        <Text style={styles.clientMetaText}>{client.type}</Text>
      </View>
      <Text style={styles.clientBiz} numberOfLines={1}>{client.natureOfBiz}</Text>
      <View style={styles.clientFooter}>
        <View style={styles.clientMeta}>
          <Ionicons name="calendar-outline" size={11} color={Colors.textMuted} />
          <Text style={styles.clientDate}>{new Date(client.registeredAt).toLocaleDateString()}</Text>
          {client.isIndebted && <View style={styles.indebtedBadge}><Text style={styles.indebtedText}>INDEBTED</Text></View>}
          {client.isPremium && <View style={styles.premiumBadge}><Text style={styles.premiumText}>★ PREMIUM</Text></View>}
        </View>
        <View style={styles.reviewBtn}>
          <Text style={styles.reviewBtnText}>{client.status === 'pending' ? 'Review' : 'View'}</Text>
          <Ionicons name="chevron-forward" size={13} color={Colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
}

function ComplaintCard({ complaint, onResolve }: { complaint: Complaint; onResolve: (id: string, status: 'reviewed' | 'resolved') => Promise<void> }) {
  const [loading, setLoading] = useState(false);
  const borderColor = complaint.status === 'open' ? Colors.danger : complaint.status === 'reviewed' ? Colors.warning : Colors.success;

  async function act(status: 'reviewed' | 'resolved') {
    setLoading(true);
    await onResolve(complaint.id, status);
    setLoading(false);
  }

  return (
    <View style={[styles.complaintCard, { borderLeftColor: borderColor }]}>
      <View style={styles.complaintTop}>
        <Text style={styles.complaintName}>{complaint.reporterName}</Text>
        <View style={[styles.statusBadge, { backgroundColor: borderColor + '22', borderWidth: 1, borderColor }]}>
          <Text style={[styles.statusBadgeText, { color: borderColor }]}>{complaint.status.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.complaintPhone}>{complaint.reporterPhone}</Text>
      <Text style={styles.complaintDesc}>{complaint.description}</Text>
      {complaint.recommendation && (
        <View style={styles.recommendBox}>
          <Ionicons name="bulb-outline" size={13} color={Colors.info} />
          <Text style={styles.recommendText}>{complaint.recommendation}</Text>
        </View>
      )}
      <Text style={styles.complaintDate}>{new Date(complaint.createdAt).toLocaleDateString()}</Text>
      {complaint.status !== 'resolved' && (
        <View style={styles.complaintActions}>
          {complaint.status === 'open' && (
            <TouchableOpacity style={[styles.complaintBtn, { backgroundColor: Colors.warningLight }]} onPress={() => act('reviewed')} disabled={loading}>
              <Ionicons name="eye-outline" size={14} color={Colors.warning} />
              <Text style={[styles.complaintBtnText, { color: Colors.warning }]}>Mark Reviewed</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={[styles.complaintBtn, { backgroundColor: Colors.successLight }]} onPress={() => act('resolved')} disabled={loading}>
            <Ionicons name="checkmark-circle-outline" size={14} color={Colors.success} />
            <Text style={[styles.complaintBtnText, { color: Colors.success }]}>Resolve</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <View style={styles.empty}>
      <Ionicons name="document-outline" size={48} color={Colors.textMuted} />
      <Text style={styles.emptyText}>{label}</Text>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: Colors.bgLight },
  flex1:  { flex: 1 },
  scroll: { flex: 1 },

  // Header
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.primary,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 14, paddingHorizontal: 16,
  },
  headerIconBtn: { padding: 4 },
  headerInfo:    { flex: 1 },
  headerTitle:   { fontSize: 17, fontWeight: '800', color: Colors.white },
  headerSub:     { fontSize: 11, color: 'rgba(255,255,255,0.75)' },
  alertBadge:    { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: Colors.danger, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 },
  alertBadgeText:{ color: Colors.white, fontSize: 11, fontWeight: '800' },

  // Main tabs
  mainTabs: {
    flexDirection: 'row', backgroundColor: Colors.bgCard,
    borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  mainTab: { flex: 1, alignItems: 'center', paddingVertical: 10, gap: 3, position: 'relative' },
  mainTabActive: { borderBottomWidth: 2, borderBottomColor: Colors.primary },
  mainTabText: { fontSize: 10, color: Colors.textLight, fontWeight: '500' },
  mainTabTextActive: { color: Colors.primary, fontWeight: '700' },
  tabDot: { position: 'absolute', top: 6, right: 8, backgroundColor: Colors.danger, borderRadius: 8, minWidth: 16, height: 16, alignItems: 'center', justifyContent: 'center' },
  tabDotText: { color: Colors.white, fontSize: 9, fontWeight: '800' },

  // KPI
  kpiRow:  { flexDirection: 'row', padding: 12, gap: 8 },
  kpiCard: { flex: 1, backgroundColor: Colors.bgCard, borderRadius: 10, padding: 10, alignItems: 'center', borderTopWidth: 3, elevation: 1, shadowColor: Colors.black, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 2 },
  kpiValue:{ fontSize: 22, fontWeight: '900', marginTop: 4 },
  kpiLabel:{ fontSize: 10, color: Colors.textLight, marginTop: 2 },

  // Section card
  sectionCard: { backgroundColor: Colors.bgCard, borderRadius: 12, marginHorizontal: 12, marginBottom: 12, padding: 14, elevation: 1, shadowColor: Colors.black, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 12 },
  sectionTitle: { flex: 1, fontSize: 13, fontWeight: '800', color: Colors.textDark },
  sectionAction: { fontSize: 12, color: Colors.primary, fontWeight: '600' },

  // Health bar
  healthBar: { flexDirection: 'row', height: 16, borderRadius: 8, overflow: 'hidden', marginBottom: 10 },
  healthSeg: { },
  healthLegend: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
  legendDot: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  legendLabel: { fontSize: 11, color: Colors.textMedium },
  healthRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 2 },
  healthChip: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  healthChipText: { fontSize: 11, fontWeight: '600' },

  // Bar row
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  barLabel: { width: 120, fontSize: 12, color: Colors.textMedium },
  barTrack: { flex: 1, height: 10, flexDirection: 'row', backgroundColor: Colors.borderLight, borderRadius: 5, overflow: 'hidden' },
  barFill:  { borderRadius: 5 },
  barCount: { width: 28, fontSize: 12, fontWeight: '700', color: Colors.textDark, textAlign: 'right' },

  // Split bar
  splitBar: { flexDirection: 'row', height: 40, borderRadius: 8, overflow: 'hidden', gap: 2 },
  splitSeg: { alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  splitLabel: { color: Colors.white, fontSize: 11, fontWeight: '700' },

  // Agent row
  agentRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  agentRank: { width: 22, height: 22, borderRadius: 11, backgroundColor: Colors.borderLight, alignItems: 'center', justifyContent: 'center' },
  agentRankText: { fontSize: 11, fontWeight: '800', color: Colors.textDark },
  agentCode: { width: 90, fontSize: 12, color: Colors.textMedium, fontWeight: '500' },
  agentBarWrap: { flex: 1, height: 10, flexDirection: 'row', backgroundColor: Colors.borderLight, borderRadius: 5, overflow: 'hidden' },
  agentBar: { backgroundColor: Colors.primary, borderRadius: 5 },
  agentCount: { width: 24, fontSize: 12, fontWeight: '700', color: Colors.primary, textAlign: 'right' },

  // Expiry row
  expiryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  expiryLeft: { flex: 1 },
  expiryName: { fontSize: 13, fontWeight: '600', color: Colors.textDark },
  expirySub:  { fontSize: 11, color: Colors.textLight },
  expiryDateBox: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  expiryDate: { fontSize: 12, color: Colors.danger, fontWeight: '600' },

  // Recent row
  recentRow: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.borderLight },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  recentName: { fontSize: 13, fontWeight: '600', color: Colors.textDark },
  recentSub:  { fontSize: 11, color: Colors.textLight },

  // Quick actions
  quickActions: { flexDirection: 'row', paddingHorizontal: 12, gap: 10, marginTop: 4 },
  qaBtn: { flex: 1, backgroundColor: Colors.bgCard, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, alignItems: 'center', paddingVertical: 14, gap: 6 },
  qaBtnText: { fontSize: 12, fontWeight: '700', color: Colors.textDark },

  // Revenue
  revenueHero: { margin: 12, backgroundColor: Colors.primary, borderRadius: 16, padding: 20, alignItems: 'center' },
  revenueLabel: { fontSize: 12, color: 'rgba(255,255,255,0.75)', marginBottom: 4 },
  revenueAmount: { fontSize: 32, fontWeight: '900', color: Colors.white, marginBottom: 4 },
  revenueSub: { fontSize: 11, color: 'rgba(255,255,255,0.6)', textAlign: 'center' },

  // Search
  searchBar: { flexDirection: 'row', alignItems: 'center', gap: 8, margin: 12, backgroundColor: Colors.bgCard, borderRadius: 10, borderWidth: 1, borderColor: Colors.border, paddingHorizontal: 12, paddingVertical: 8 },
  searchInput: { flex: 1, fontSize: 13, color: Colors.textDark, padding: 0 },

  // Filter chips
  filterScroll: { paddingHorizontal: 12 },
  filterChips: { flexDirection: 'row', gap: 8, paddingBottom: 10 },
  filterChip: { borderWidth: 1, borderColor: Colors.border, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, backgroundColor: Colors.bgCard },
  filterChipText: { fontSize: 12, color: Colors.textMedium, fontWeight: '500' },

  // List
  list: { padding: 12, paddingBottom: 24 },

  // Client card
  clientCard: { backgroundColor: Colors.bgCard, borderRadius: 12, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: Colors.borderLight, elevation: 1, shadowColor: Colors.black, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 },
  clientCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  clientName: { fontSize: 14, fontWeight: '700', color: Colors.textDark },
  clientCode: { fontSize: 11, color: Colors.primary, fontWeight: '600', marginTop: 2 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  statusBadgeText: { fontSize: 10, fontWeight: '800' },
  clientMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  clientMetaText: { fontSize: 11, color: Colors.textLight },
  clientBiz: { fontSize: 12, color: Colors.textMedium, marginBottom: 8 },
  clientFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  clientDate: { fontSize: 11, color: Colors.textLight },
  indebtedBadge: { backgroundColor: Colors.dangerLight, borderRadius: 6, paddingHorizontal: 5, paddingVertical: 1 },
  indebtedText: { fontSize: 9, color: Colors.danger, fontWeight: '800' },
  premiumBadge: { backgroundColor: '#FFF8E1', borderRadius: 6, paddingHorizontal: 5, paddingVertical: 1 },
  premiumText: { fontSize: 9, color: Colors.gold, fontWeight: '800' },
  reviewBtn: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  reviewBtnText: { fontSize: 12, color: Colors.primary, fontWeight: '700' },

  // Complaint card
  complaintCard: { backgroundColor: Colors.bgCard, borderRadius: 12, padding: 14, marginBottom: 10, borderLeftWidth: 4 },
  complaintTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  complaintName: { fontSize: 14, fontWeight: '700', color: Colors.textDark },
  complaintPhone: { fontSize: 12, color: Colors.textLight, marginBottom: 6 },
  complaintDesc: { fontSize: 13, color: Colors.textMedium, lineHeight: 18, marginBottom: 6 },
  recommendBox: { flexDirection: 'row', alignItems: 'flex-start', gap: 6, backgroundColor: Colors.infoLight, borderRadius: 8, padding: 8, marginBottom: 6 },
  recommendText: { flex: 1, fontSize: 12, color: Colors.info, lineHeight: 17 },
  complaintDate: { fontSize: 11, color: Colors.textMuted, marginBottom: 8 },
  complaintActions: { flexDirection: 'row', gap: 8 },
  complaintBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7 },
  complaintBtnText: { fontSize: 12, fontWeight: '700' },

  // Empty
  empty: { alignItems: 'center', justifyContent: 'center', padding: 40, gap: 10 },
  emptyText: { fontSize: 15, color: Colors.textMedium, fontWeight: '500' },
});
