import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, Platform,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../constants/colors';
import { useAppStore } from '../../../store/useAppStore';
import { getCategoryById } from '../../../constants/categories';
import { PAYMENT_BANDS, DURATIONS } from '../../../constants/subscriptions';

export default function ApproveClientScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const currentAdmin = useAppStore(s => s.currentAdmin);
  const clients = useAppStore(s => s.clients);
  const client = clients.find(c => c.id === (id ?? ''));
  const approveClient = useAppStore(s => s.approveClient);
  const rejectClient = useAppStore(s => s.rejectClient);
  const suspendClient = useAppStore(s => s.suspendClient);
  const unsuspendClient = useAppStore(s => s.unsuspendClient);
  const markIndebted = useAppStore(s => s.markIndebted);

  const [confirmCode, setConfirmCode] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [suspendReason, setSuspendReason] = useState('');
  const [showReject, setShowReject] = useState(false);
  const [showSuspend, setShowSuspend] = useState(false);

  useEffect(() => {
    if (!currentAdmin) router.replace('/admin/login');
  }, [currentAdmin]);
  if (!currentAdmin) return null;
  if (!client) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Registration not found</Text>
        <TouchableOpacity onPress={() => router.back()}><Text style={{ color: Colors.primary }}>Go Back</Text></TouchableOpacity>
      </View>
    );
  }

  function handleApprove() {
    if (!confirmCode.trim()) {
      Alert.alert('Required', 'You must enter your admin code to approve this registration.');
      return;
    }
    if (confirmCode.trim().toUpperCase() !== currentAdmin!.adminCode) {
      Alert.alert('Invalid Code', 'The admin code entered does not match your assigned code.');
      return;
    }
    Alert.alert(
      'Confirm Approval',
      `Approve "${client!.businessName}"? This will make them visible on the platform.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve', onPress: () => {
            approveClient(client!.id, currentAdmin!.adminCode);
            Alert.alert('Approved', `${client!.businessName} is now live on CityHup.`, [
              { text: 'OK', onPress: () => router.back() }
            ]);
          }
        },
      ]
    );
  }

  function handleReject() {
    if (!confirmCode.trim()) {
      Alert.alert('Required', 'Enter your admin code to reject this registration.');
      return;
    }
    if (confirmCode.trim().toUpperCase() !== currentAdmin!.adminCode) {
      Alert.alert('Invalid Code', 'Admin code mismatch.');
      return;
    }
    if (!rejectReason.trim()) {
      Alert.alert('Required', 'Please provide a reason for rejection.');
      return;
    }
    Alert.alert(
      'Confirm Rejection',
      `Reject "${client!.businessName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject', style: 'destructive', onPress: () => {
            rejectClient(client!.id, currentAdmin!.adminCode, rejectReason);
            Alert.alert('Rejected', 'Registration has been rejected.', [
              { text: 'OK', onPress: () => router.back() }
            ]);
          }
        },
      ]
    );
  }

  const payBand = PAYMENT_BANDS.find(p => p.value === client.paymentBand);
  const dur = DURATIONS.find(d => d.value === client.duration);

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Review Registration</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Status banner */}
        <View style={[
          styles.statusBanner,
          client.status === 'pending'
            ? { backgroundColor: Colors.warningLight, borderColor: Colors.warning }
            : client.status === 'approved'
            ? { backgroundColor: Colors.successLight, borderColor: Colors.success }
            : { backgroundColor: Colors.dangerLight, borderColor: Colors.danger }
        ]}>
          <Ionicons
            name={client.status === 'pending' ? 'time' : client.status === 'approved' ? 'checkmark-circle' : 'close-circle'}
            size={18}
            color={client.status === 'pending' ? Colors.warning : client.status === 'approved' ? Colors.success : Colors.danger}
          />
          <Text style={[
            styles.statusText,
            { color: client.status === 'pending' ? Colors.warning : client.status === 'approved' ? Colors.success : Colors.danger }
          ]}>
            Status: {client.status.toUpperCase()}
            {client.approvedBy ? ` • By ${client.approvedBy}` : ''}
          </Text>
        </View>

        <Section title="Business Information">
          <Row label="Business Name" value={client.businessName} />
          <Row label="Client Code" value={client.clientCode} />
          <Row label="Type" value={client.type === 'corporate' ? 'Corporate (Registered)' : 'Individual (Unregistered)'} />
          <Row label="Nature of Business" value={client.natureOfBiz} />
          <Row label="CAC Number" value={client.cacNumber || 'N/A'} />
          <Row label="Competence" value={client.competence} />
        </Section>

        <Section title="Location">
          <Row label="Country" value={client.country} />
          <Row label="State" value={client.state} />
          <Row label="LGA" value={client.lga} />
          <Row label="City" value={client.city} />
          <Row label="Area" value={client.area} />
          <Row label="Town" value={client.town} />
          <Row label="Address" value={client.address} />
          <Row label="Nearest Bus Stop" value={client.nearestBusStop} />
          <Row label="Nearest Landmark" value={client.nearestLandmark} />
        </Section>

        <Section title="Contact Details">
          <Row label="Phone" value={client.phone} />
          <Row label="Email" value={client.email} />
          <Row label="Website" value={client.websiteLink || 'N/A'} />
        </Section>

        <Section title="Profile & Info">
          <Row label="Profile" value={client.profile} />
          <Row label="Additional Info" value={client.info || 'N/A'} />
        </Section>

        <Section title="Director / Referral">
          <Row label="Director / Person of Responsibility" value={client.director || 'N/A'} />
          <Row label="Referral / Guarantor" value={client.referral || 'N/A'} />
          {client.identification && (
            <Row
              label="Means of Identification"
              value={`${client.identification.type}: ${client.identification.number}`}
            />
          )}
        </Section>

        <Section title="Categories">
          {client.categories.map(catId => {
            const cat = getCategoryById(catId);
            return cat ? (
              <View key={catId} style={styles.catTag}>
                <Ionicons name={cat.icon as any} size={13} color={cat.color} />
                <Text style={[styles.catTagText, { color: cat.color }]}>{cat.label}</Text>
              </View>
            ) : null;
          })}
        </Section>

        <Section title="Subscription & Payment">
          <Row label="Payment Band" value={payBand?.label ?? `₦${client.paymentBand.toLocaleString()}`} />
          <Row label="Duration" value={dur?.label ?? `${client.duration} Month(s)`} />
          <Row label="Payment Method" value={client.paymentMethod.toUpperCase()} />
          <Row label="Registered By (Agent)" value={client.registeredBy} />
          <Row label="Registration Date" value={new Date(client.registeredAt).toLocaleString()} />
        </Section>

        {/* Admin action panel (only for pending) */}
        {client.status === 'pending' && (
          <View style={styles.actionPanel}>
            <Text style={styles.actionTitle}>Admin Action Required</Text>
            <Text style={styles.actionSub}>
              Verify the details above — confirm that subscription is paid, address is valid, and landmark exists. Then enter your admin code to approve or reject.
            </Text>

            <Text style={styles.actionLabel}>Your Admin Code *</Text>
            <TextInput
              style={styles.codeInput}
              value={confirmCode}
              onChangeText={setConfirmCode}
              placeholder={`Enter ${currentAdmin.adminCode}`}
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="characters"
            />

            {showReject && (
              <>
                <Text style={styles.actionLabel}>Rejection Reason *</Text>
                <TextInput
                  style={[styles.codeInput, { height: 70, textAlignVertical: 'top' }]}
                  value={rejectReason}
                  onChangeText={setRejectReason}
                  placeholder="Explain why this registration is being rejected…"
                  placeholderTextColor={Colors.textMuted}
                  multiline
                />
              </>
            )}

            <View style={styles.actionBtns}>
              <TouchableOpacity
                style={styles.rejectBtn}
                onPress={() => {
                  if (!showReject) { setShowReject(true); return; }
                  handleReject();
                }}
              >
                <Ionicons name="close-circle" size={18} color={Colors.danger} />
                <Text style={styles.rejectBtnText}>Reject</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.approveBtn} onPress={handleApprove}>
                <Ionicons name="checkmark-circle" size={18} color={Colors.white} />
                <Text style={styles.approveBtnText}>Approve</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Approved client — Suspend / Indebted actions */}
        {client.status === 'approved' && (
          <View style={styles.actionPanel}>
            <Text style={styles.actionTitle}>Manage Client</Text>

            <Text style={styles.actionLabel}>Your Admin Code *</Text>
            <TextInput
              style={styles.codeInput}
              value={confirmCode}
              onChangeText={setConfirmCode}
              placeholder={`Enter ${currentAdmin?.adminCode}`}
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="characters"
            />

            {/* Mark indebted toggle */}
            <TouchableOpacity
              style={[styles.indebtedBtn, client.isIndebted && styles.indebtedBtnActive]}
              onPress={() => {
                if (!confirmCode.trim() || confirmCode.trim().toUpperCase() !== currentAdmin?.adminCode) {
                  Alert.alert('Invalid Code', 'Enter your admin code first'); return;
                }
                markIndebted(client.id, !client.isIndebted);
                Alert.alert(client.isIndebted ? 'Cleared' : 'Flagged', client.isIndebted ? 'Indebted flag removed. Profile is visible again.' : 'Client flagged as indebted. Profile hidden from public.');
              }}
            >
              <Ionicons name={client.isIndebted ? 'checkmark-circle' : 'alert-circle-outline'} size={16} color={client.isIndebted ? Colors.white : Colors.accent} />
              <Text style={[styles.indebtedBtnText, client.isIndebted && { color: Colors.white }]}>
                {client.isIndebted ? 'Remove Indebted Flag' : 'Mark as Indebted (hides profile)'}
              </Text>
            </TouchableOpacity>

            {showSuspend && (
              <>
                <Text style={[styles.actionLabel, { marginTop: 8 }]}>Suspension Reason *</Text>
                <TextInput
                  style={[styles.codeInput, { height: 70, textAlignVertical: 'top' }]}
                  value={suspendReason}
                  onChangeText={setSuspendReason}
                  placeholder="Reason for suspension…"
                  placeholderTextColor={Colors.textMuted}
                  multiline
                />
              </>
            )}

            <TouchableOpacity
              style={styles.suspendBtn}
              onPress={() => {
                if (!showSuspend) { setShowSuspend(true); return; }
                if (!confirmCode.trim() || confirmCode.trim().toUpperCase() !== currentAdmin?.adminCode) {
                  Alert.alert('Invalid Code', 'Admin code mismatch'); return;
                }
                if (!suspendReason.trim()) { Alert.alert('Required', 'Enter a suspension reason'); return; }
                Alert.alert('Confirm Suspension', `Suspend "${client.businessName}"? They will be hidden from the public.`, [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Suspend', style: 'destructive', onPress: () => {
                    suspendClient(client.id, currentAdmin!.adminCode, suspendReason);
                    Alert.alert('Suspended', 'Client has been suspended.', [{ text: 'OK', onPress: () => router.back() }]);
                  }},
                ]);
              }}
            >
              <Ionicons name="ban" size={16} color={Colors.danger} />
              <Text style={styles.suspendBtnText}>{showSuspend ? 'Confirm Suspension' : 'Suspend Client'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Suspended client — Unsuspend action */}
        {client.status === 'suspended' && (
          <View style={styles.actionPanel}>
            <Text style={styles.actionTitle}>Client Suspended</Text>
            <Text style={styles.actionSub}>Suspension reason: {client.suspendedReason}</Text>
            <Text style={styles.actionLabel}>Your Admin Code *</Text>
            <TextInput
              style={styles.codeInput}
              value={confirmCode}
              onChangeText={setConfirmCode}
              placeholder={`Enter ${currentAdmin?.adminCode}`}
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={styles.approveBtn}
              onPress={() => {
                if (!confirmCode.trim() || confirmCode.trim().toUpperCase() !== currentAdmin?.adminCode) {
                  Alert.alert('Invalid Code', 'Admin code mismatch'); return;
                }
                unsuspendClient(client.id, currentAdmin!.adminCode);
                Alert.alert('Unsuspended', 'Client is now active again.', [{ text: 'OK', onPress: () => router.back() }]);
              }}
            >
              <Ionicons name="checkmark-circle" size={18} color={Colors.white} />
              <Text style={styles.approveBtnText}>Reinstate Client</Text>
            </TouchableOpacity>
          </View>
        )}

        {(client.status === 'rejected') && (
          <View style={[styles.actionPanel, { backgroundColor: Colors.bgLight }]}>
            <Text style={styles.actionSub}>
              This registration has already been {client.status}.
              {client.rejectedReason ? `\n\nRejection reason: ${client.rejectedReason}` : ''}
            </Text>
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgLight },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundText: { fontSize: 17, color: Colors.textMedium, fontWeight: '600' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.primary,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 14, paddingHorizontal: 16,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.white },
  scroll: { flex: 1 },

  statusBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    margin: 12, borderRadius: 10, padding: 12, borderWidth: 1,
  },
  statusText: { fontSize: 13, fontWeight: '700' },

  section: {
    backgroundColor: Colors.bgCard, margin: 12, marginBottom: 0,
    borderRadius: 12, padding: 14, borderWidth: 1, borderColor: Colors.borderLight,
  },
  sectionTitle: {
    fontSize: 13, fontWeight: '800', color: Colors.primary,
    marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight, paddingBottom: 6,
  },
  row: { flexDirection: 'row', marginBottom: 8, gap: 8 },
  rowLabel: { width: 160, fontSize: 12, color: Colors.textLight, fontWeight: '500', flexShrink: 0 },
  rowValue: { flex: 1, fontSize: 13, color: Colors.textDark, fontWeight: '500' },

  catTag: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderWidth: 1, borderColor: Colors.border, borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 4, marginBottom: 6, alignSelf: 'flex-start',
  },
  catTagText: { fontSize: 12, fontWeight: '600' },

  actionPanel: {
    margin: 12, backgroundColor: Colors.bgCard,
    borderRadius: 14, padding: 16,
    borderWidth: 1, borderColor: Colors.border,
    marginTop: 16,
  },
  actionTitle: { fontSize: 16, fontWeight: '800', color: Colors.textDark, marginBottom: 6 },
  actionSub: { fontSize: 13, color: Colors.textMedium, lineHeight: 18, marginBottom: 14 },
  actionLabel: { fontSize: 13, fontWeight: '600', color: Colors.textDark, marginBottom: 5 },
  codeInput: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14,
    color: Colors.textDark, backgroundColor: Colors.bgLight, marginBottom: 12,
  },
  actionBtns: { flexDirection: 'row', gap: 10, marginTop: 4 },
  rejectBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, borderWidth: 1.5, borderColor: Colors.danger, borderRadius: 12, paddingVertical: 13,
    backgroundColor: Colors.dangerLight,
  },
  rejectBtnText: { color: Colors.danger, fontWeight: '700', fontSize: 14 },
  approveBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, backgroundColor: Colors.success, borderRadius: 12, paddingVertical: 13,
  },
  approveBtnText: { color: Colors.white, fontWeight: '800', fontSize: 14 },
  suspendBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, borderWidth: 1.5, borderColor: Colors.danger, borderRadius: 12,
    paddingVertical: 13, backgroundColor: Colors.dangerLight, marginTop: 10,
  },
  suspendBtnText: { color: Colors.danger, fontWeight: '700', fontSize: 14 },
  indebtedBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1.5, borderColor: Colors.accent, borderRadius: 12,
    paddingVertical: 12, paddingHorizontal: 14, marginTop: 10,
    backgroundColor: Colors.accentLight,
  },
  indebtedBtnActive: { backgroundColor: Colors.accent, borderColor: Colors.accent },
  indebtedBtnText: { color: Colors.accent, fontWeight: '700', fontSize: 13, flex: 1 },
});
