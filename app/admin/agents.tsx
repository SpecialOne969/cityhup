import React, { useEffect, useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useAppStore } from '../../store/useAppStore';
import { Agent } from '../../types';

type Filter = 'all' | 'pending' | 'approved' | 'suspended';

const FMT = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 });

export default function AdminAgentsScreen() {
  const router = useRouter();
  const currentAdmin = useAppStore(s => s.currentAdmin);
  const agents = useAppStore(s => s.agents);
  const loadAgents = useAppStore(s => s.loadAgents);
  const approveAgent = useAppStore(s => s.approveAgent);
  const suspendAgent = useAppStore(s => s.suspendAgent);

  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!currentAdmin) { router.replace('/admin/login'); return; }
    loadAgents();
  }, []);

  if (!currentAdmin) return null;

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return agents.filter(a => {
      const matchFilter = filter === 'all' || a.status === filter;
      const matchSearch = !q ||
        a.fullName.toLowerCase().includes(q) ||
        a.agentCode.toLowerCase().includes(q) ||
        a.email.toLowerCase().includes(q) ||
        a.state.toLowerCase().includes(q);
      return matchFilter && matchSearch;
    });
  }, [agents, filter, search]);

  const pending   = agents.filter(a => a.status === 'pending').length;
  const approved  = agents.filter(a => a.status === 'approved').length;
  const suspended = agents.filter(a => a.status === 'suspended').length;

  async function handleApprove(id: string) {
    setActionId(id); setError('');
    try { await approveAgent(id); } catch (e: any) { setError(e.message); }
    finally { setActionId(null); }
  }

  async function handleSuspend(id: string) {
    setActionId(id); setError('');
    try { await suspendAgent(id); } catch (e: any) { setError(e.message); }
    finally { setActionId(null); }
  }

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Agent Management</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Summary */}
        <View style={styles.summaryRow}>
          <SummaryChip label="Pending" count={pending} color={Colors.warning} />
          <SummaryChip label="Approved" count={approved} color={Colors.success} />
          <SummaryChip label="Suspended" count={suspended} color={Colors.danger} />
          <SummaryChip label="Total" count={agents.length} color={Colors.primary} />
        </View>

        {error ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={15} color={Colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Search */}
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color={Colors.textLight} />
          <TextInput
            style={styles.searchInput}
            value={search} onChangeText={setSearch}
            placeholder="Search by name, code, email or state…"
            placeholderTextColor={Colors.textMuted}
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={16} color={Colors.textLight} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Filters */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {(['all', 'pending', 'approved', 'suspended'] as Filter[]).map(f => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, filter === f && styles.filterChipActive]}
              onPress={() => setFilter(f)}
            >
              <Text style={[styles.filterChipText, filter === f && styles.filterChipTextActive]}>
                {f.charAt(0).toUpperCase() + f.slice(1)}
                {f === 'pending' && pending > 0 ? ` (${pending})` : ''}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Agent list */}
        {filtered.length === 0 && (
          <View style={styles.empty}>
            <Ionicons name="briefcase-outline" size={40} color={Colors.textMuted} />
            <Text style={styles.emptyText}>No agents found.</Text>
          </View>
        )}

        {filtered.map(agent => (
          <AgentCard
            key={agent.id}
            agent={agent}
            loading={actionId === agent.id}
            onApprove={() => handleApprove(agent.id)}
            onSuspend={() => handleSuspend(agent.id)}
          />
        ))}

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

function AgentCard({ agent, loading, onApprove, onSuspend }: {
  agent: Agent;
  loading: boolean;
  onApprove: () => void;
  onSuspend: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const statusColor =
    agent.status === 'approved' ? Colors.success :
    agent.status === 'pending'  ? Colors.warning : Colors.danger;

  return (
    <View style={styles.agentCard}>
      <TouchableOpacity style={styles.agentCardHeader} onPress={() => setExpanded(v => !v)}>
        <View style={styles.agentAvatar}>
          <Text style={styles.agentAvatarText}>{agent.fullName.charAt(0).toUpperCase()}</Text>
        </View>
        <View style={styles.agentMeta}>
          <Text style={styles.agentName}>{agent.fullName}</Text>
          <Text style={styles.agentCode}>{agent.agentCode} · {agent.state}</Text>
        </View>
        <View style={styles.agentRight}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '22' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
            </Text>
          </View>
          <Ionicons name={expanded ? 'chevron-up' : 'chevron-down'} size={16} color={Colors.textLight} />
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.agentDetails}>
          <Row label="Email" value={agent.email} />
          <Row label="Phone" value={agent.phone} />
          <Row label="LGA" value={agent.lga || '—'} />
          <Row label="City" value={agent.city || '—'} />
          <Row label="Account Name" value={agent.accountName || '—'} />
          <Row label="Account Number" value={agent.accountNumber || '—'} />
          <Row label="Referred By" value={agent.referredBy || '—'} />
          <Row label="Commission Rate" value={`${Math.round(agent.commissionRate * 100)}%`} />
          <Row label="Monthly Target" value={String(agent.monthlyTarget)} />
          <Row label="Withdrawal Threshold" value={String(agent.withdrawalThreshold)} />
          <Row label="Registered" value={new Date(agent.registeredAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })} />

          <View style={styles.actionRow}>
            {agent.status !== 'approved' && (
              <TouchableOpacity
                style={[styles.approveBtn, loading && { opacity: 0.6 }]}
                onPress={onApprove} disabled={loading}
              >
                <Ionicons name="checkmark-circle-outline" size={16} color={Colors.white} />
                <Text style={styles.approveBtnText}>{loading ? 'Processing…' : 'Approve'}</Text>
              </TouchableOpacity>
            )}
            {agent.status !== 'suspended' && (
              <TouchableOpacity
                style={[styles.suspendBtn, loading && { opacity: 0.6 }]}
                onPress={onSuspend} disabled={loading}
              >
                <Ionicons name="pause-circle-outline" size={16} color={Colors.danger} />
                <Text style={styles.suspendBtnText}>{loading ? 'Processing…' : 'Suspend'}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function SummaryChip({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <View style={[styles.summaryChip, { borderLeftColor: color }]}>
      <Text style={[styles.summaryCount, { color }]}>{count}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgLight },
  header: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 14, paddingHorizontal: 16, gap: 12,
  },
  backBtn: { padding: 4 },
  headerTitle: { flex: 1, fontSize: 17, fontWeight: '700', color: Colors.white },
  scroll: { flex: 1 },

  summaryRow: { flexDirection: 'row', gap: 8, padding: 14 },
  summaryChip: {
    flex: 1, backgroundColor: Colors.bgCard, borderRadius: 10, padding: 10,
    borderWidth: 1, borderColor: Colors.borderLight, borderLeftWidth: 4, alignItems: 'center',
  },
  summaryCount: { fontSize: 20, fontWeight: '900' },
  summaryLabel: { fontSize: 10, color: Colors.textLight, marginTop: 2 },

  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.dangerLight, margin: 14, borderRadius: 8, padding: 12,
  },
  errorText: { flex: 1, fontSize: 13, color: Colors.danger },

  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.bgCard, margin: 14, marginTop: 0,
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10,
    borderWidth: 1, borderColor: Colors.border,
  },
  searchInput: { flex: 1, fontSize: 14, color: Colors.textDark },
  filterRow: { gap: 8, paddingHorizontal: 14, paddingBottom: 12 },
  filterChip: {
    paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
    backgroundColor: Colors.borderLight, borderWidth: 1, borderColor: Colors.border,
  },
  filterChipActive: { backgroundColor: Colors.primary, borderColor: Colors.primary },
  filterChipText: { fontSize: 12, color: Colors.textMedium, fontWeight: '500' },
  filterChipTextActive: { color: Colors.white, fontWeight: '700' },

  empty: { alignItems: 'center', padding: 40, gap: 8 },
  emptyText: { fontSize: 14, color: Colors.textMuted },

  agentCard: {
    backgroundColor: Colors.bgCard, marginHorizontal: 14, marginBottom: 8,
    borderRadius: 14, borderWidth: 1, borderColor: Colors.borderLight, overflow: 'hidden',
  },
  agentCardHeader: {
    flexDirection: 'row', alignItems: 'center', padding: 14, gap: 10,
  },
  agentAvatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  agentAvatarText: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  agentMeta: { flex: 1 },
  agentName: { fontSize: 14, fontWeight: '700', color: Colors.textDark },
  agentCode: { fontSize: 12, color: Colors.textLight, marginTop: 2 },
  agentRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 11, fontWeight: '700' },
  agentDetails: { borderTopWidth: 1, borderTopColor: Colors.borderLight, padding: 14 },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  detailLabel: { fontSize: 12, color: Colors.textLight },
  detailValue: { fontSize: 12, color: Colors.textDark, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  actionRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  approveBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: Colors.success, borderRadius: 10, paddingVertical: 11,
  },
  approveBtnText: { color: Colors.white, fontWeight: '700', fontSize: 13 },
  suspendBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, borderRadius: 10, paddingVertical: 11,
    borderWidth: 1.5, borderColor: Colors.danger,
  },
  suspendBtnText: { color: Colors.danger, fontWeight: '700', fontSize: 13 },
});
