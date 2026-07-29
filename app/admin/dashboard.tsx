import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, Alert, Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useAppStore } from '../../store/useAppStore';
import { Client } from '../../types';

type TabKey = 'pending' | 'approved' | 'suspended' | 'rejected' | 'complaints';

export default function AdminDashboard() {
  const router = useRouter();
  const currentAdmin = useAppStore(s => s.currentAdmin);
  const clients = useAppStore(s => s.clients);
  const complaints = useAppStore(s => s.complaints);
  const logout = useAppStore(s => s.logout);

  const [tab, setTab] = useState<TabKey>('pending');

  useEffect(() => {
    if (!currentAdmin) router.replace('/admin/login');
  }, [currentAdmin]);

  if (!currentAdmin) return null;

  const pending = clients.filter(c => c.status === 'pending');
  const approved = clients.filter(c => c.status === 'approved');
  const suspended = clients.filter(c => c.status === 'suspended');
  const rejected = clients.filter(c => c.status === 'rejected');
  const indebted = clients.filter(c => c.isIndebted);

  const displayClients =
    tab === 'pending' ? pending :
    tab === 'approved' ? approved :
    tab === 'suspended' ? suspended :
    tab === 'rejected' ? rejected : [];

  function handleLogout() {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => { logout().then(() => router.replace('/')); } },
    ]);
  }

  const tabDef: { key: TabKey; label: string; count: number; color: string }[] = [
    { key: 'pending', label: 'Pending', count: pending.length, color: Colors.warning },
    { key: 'approved', label: 'Approved', count: approved.length, color: Colors.success },
    { key: 'suspended', label: 'Suspended', count: suspended.length, color: Colors.danger },
    { key: 'rejected', label: 'Rejected', count: rejected.length, color: Colors.textLight },
    { key: 'complaints', label: 'Complaints', count: complaints.length, color: Colors.info },
  ];

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/')} style={styles.headerBack}>
          <Ionicons name="home-outline" size={20} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <Text style={styles.headerSub}>{currentAdmin.name} • {currentAdmin.adminCode}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
          <Ionicons name="log-out-outline" size={20} color={Colors.white} />
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <StatCard label="Pending" value={pending.length} color={Colors.warning} icon="time" />
        <StatCard label="Approved" value={approved.length} color={Colors.success} icon="checkmark-circle" />
        <StatCard label="Suspended" value={suspended.length} color={Colors.danger} icon="ban" />
        <StatCard label="Indebted" value={indebted.length} color={Colors.accent} icon="alert-circle" />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {tabDef.map(t => (
          <TouchableOpacity
            key={t.key}
            style={[styles.tab, tab === t.key && { borderBottomColor: t.color, borderBottomWidth: 3 }]}
            onPress={() => setTab(t.key)}
          >
            <Text style={[styles.tabText, tab === t.key && { color: t.color, fontWeight: '700' }]}>
              {t.label}
            </Text>
            {t.count > 0 && (
              <View style={[styles.tabBadge, { backgroundColor: t.color }]}>
                <Text style={styles.tabBadgeText}>{t.count}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {tab === 'complaints' ? (
        <FlatList
          data={complaints}
          keyExtractor={c => c.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState label="No complaints yet" />}
          renderItem={({ item }) => (
            <View style={styles.complaintCard}>
              <View style={styles.complaintHeader}>
                <Text style={styles.complaintName}>{item.reporterName}</Text>
                <View style={[styles.statusBadge, { backgroundColor: item.status === 'open' ? Colors.warningLight : Colors.successLight }]}>
                  <Text style={[styles.statusBadgeText, { color: item.status === 'open' ? Colors.warning : Colors.success }]}>
                    {item.status.toUpperCase()}
                  </Text>
                </View>
              </View>
              <Text style={styles.complaintPhone}>{item.reporterPhone}</Text>
              <Text style={styles.complaintDesc}>{item.description}</Text>
              <Text style={styles.complaintDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
            </View>
          )}
        />
      ) : (
        <FlatList
          data={displayClients}
          keyExtractor={c => c.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<EmptyState label={`No ${tab} registrations`} />}
          renderItem={({ item }) => (
            <AdminClientCard
              client={item}
              onPress={() => router.push({ pathname: '/admin/approve/[id]', params: { id: item.id } })}
            />
          )}
        />
      )}
    </View>
  );
}

function StatCard({ label, value, color, icon }: { label: string; value: number; color: string; icon: string }) {
  return (
    <View style={[styles.statCard, { borderTopColor: color }]}>
      <Ionicons name={icon as any} size={18} color={color} />
      <Text style={[styles.statValue, { color }]}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function AdminClientCard({ client, onPress }: { client: Client; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.clientCard} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.clientCardHeader}>
        <View>
          <Text style={styles.clientName}>{client.businessName}</Text>
          <Text style={styles.clientCode}>{client.clientCode}</Text>
        </View>
        <View style={[
          styles.statusBadge,
          client.status === 'pending'
            ? { backgroundColor: Colors.warningLight }
            : client.status === 'approved'
            ? { backgroundColor: Colors.successLight }
            : { backgroundColor: Colors.dangerLight }
        ]}>
          <Text style={[
            styles.statusBadgeText,
            { color: client.status === 'pending' ? Colors.warning : client.status === 'approved' ? Colors.success : Colors.danger }
          ]}>
            {client.status.toUpperCase()}
          </Text>
        </View>
      </View>
      <View style={styles.clientMeta}>
        <Ionicons name="location-outline" size={12} color={Colors.textLight} />
        <Text style={styles.clientMetaText}>{client.area}, {client.city}, {client.state}</Text>
        <Text style={styles.clientMetaDot}>•</Text>
        <Ionicons name="person-outline" size={12} color={Colors.textLight} />
        <Text style={styles.clientMetaText}>{client.type}</Text>
      </View>
      <Text style={styles.clientBiz}>{client.natureOfBiz}</Text>
      <View style={styles.clientFooter}>
        <Text style={styles.clientDate}>Registered: {new Date(client.registeredAt).toLocaleDateString()}</Text>
        <View style={styles.reviewBtn}>
          <Text style={styles.reviewBtnText}>{client.status === 'pending' ? 'Review' : 'View Details'}</Text>
          <Ionicons name="chevron-forward" size={12} color={Colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
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

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgLight },
  header: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 14, paddingHorizontal: 16, gap: 10,
  },
  headerBack: { padding: 4 },
  headerInfo: { flex: 1 },
  headerTitle: { fontSize: 17, fontWeight: '800', color: Colors.white },
  headerSub: { fontSize: 11, color: 'rgba(255,255,255,0.75)' },
  logoutBtn: { padding: 4 },

  statsRow: { flexDirection: 'row', padding: 12, gap: 8 },
  statCard: {
    flex: 1, backgroundColor: Colors.bgCard, borderRadius: 10, padding: 10,
    alignItems: 'center', borderTopWidth: 3,
    elevation: 1, shadowColor: Colors.black, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 2,
  },
  statValue: { fontSize: 20, fontWeight: '900', marginTop: 4 },
  statLabel: { fontSize: 10, color: Colors.textLight, marginTop: 2 },

  tabs: { flexDirection: 'row', backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 11, gap: 4 },
  tabText: { fontSize: 12, color: Colors.textMedium },
  tabBadge: { borderRadius: 10, paddingHorizontal: 6, paddingVertical: 1 },
  tabBadgeText: { color: Colors.white, fontSize: 10, fontWeight: '700' },

  list: { padding: 12, paddingBottom: 24 },

  clientCard: {
    backgroundColor: Colors.bgCard, borderRadius: 12, padding: 14, marginBottom: 10,
    borderWidth: 1, borderColor: Colors.borderLight,
    elevation: 1, shadowColor: Colors.black, shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3,
  },
  clientCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  clientName: { fontSize: 14, fontWeight: '700', color: Colors.textDark },
  clientCode: { fontSize: 11, color: Colors.primary, fontWeight: '600', marginTop: 2 },
  statusBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  statusBadgeText: { fontSize: 10, fontWeight: '800' },
  clientMeta: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  clientMetaText: { fontSize: 11, color: Colors.textLight },
  clientMetaDot: { color: Colors.textMuted, fontSize: 11 },
  clientBiz: { fontSize: 12, color: Colors.textMedium, marginBottom: 8 },
  clientFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  clientDate: { fontSize: 11, color: Colors.textLight },
  reviewBtn: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  reviewBtnText: { fontSize: 12, color: Colors.primary, fontWeight: '700' },

  complaintCard: {
    backgroundColor: Colors.bgCard, borderRadius: 12, padding: 14, marginBottom: 10,
    borderLeftWidth: 4, borderLeftColor: Colors.danger,
  },
  complaintHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  complaintName: { fontSize: 14, fontWeight: '700', color: Colors.textDark },
  complaintPhone: { fontSize: 12, color: Colors.textLight, marginBottom: 6 },
  complaintDesc: { fontSize: 13, color: Colors.textMedium, lineHeight: 18, marginBottom: 6 },
  complaintDate: { fontSize: 11, color: Colors.textMuted },

  empty: { alignItems: 'center', justifyContent: 'center', padding: 40, gap: 10 },
  emptyText: { fontSize: 15, color: Colors.textMedium, fontWeight: '500' },
});
