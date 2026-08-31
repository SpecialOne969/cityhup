import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform,
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
  const approveClient    = useAppStore(s => s.approveClient);
  const rejectClient     = useAppStore(s => s.rejectClient);
  const suspendClient    = useAppStore(s => s.suspendClient);
  const unsuspendClient  = useAppStore(s => s.unsuspendClient);
  const markIndebted     = useAppStore(s => s.markIndebted);
  const setPremium       = useAppStore(s => s.setPremium);

  const [confirmCode, setConfirmCode] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [suspendReason, setSuspendReason] = useState('');

  // Inline UI states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmingApprove, setConfirmingApprove] = useState(false);
  const [confirmingReject, setConfirmingReject] = useState(false);
  const [confirmingSuspend, setConfirmingSuspend] = useState(false);

  useEffect(() => { if (!currentAdmin) router.replace('/admin/login'); }, [currentAdmin]);
  if (!currentAdmin) return null;

  if (!client) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Registration not found</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: Colors.primary, fontWeight: '600' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  function validateCode(): boolean {
    if (!confirmCode.trim()) { setError('Enter your admin code to proceed.'); return false; }
    if (confirmCode.trim().toUpperCase() !== currentAdmin!.adminCode) { setError('Admin code does not match your assigned code.'); return false; }
    setError('');
    return true;
  }

  async function doApprove() {
    setLoading(true);
    await approveClient(client!.id, currentAdmin!.adminCode);
    setLoading(false);
    setSuccess(`${client!.businessName} is now live on CityHup.`);
    setTimeout(() => router.back(), 1800);
  }

  async function doReject() {
    if (!rejectReason.trim()) { setError('Provide a rejection reason.'); return; }
    setLoading(true);
    await rejectClient(client!.id, currentAdmin!.adminCode, rejectReason);
    setLoading(false);
    setSuccess('Registration has been rejected.');
    setTimeout(() => router.back(), 1600);
  }

  async function doSuspend() {
    if (!suspendReason.trim()) { setError('Provide a suspension reason.'); return; }
    setLoading(true);
    await suspendClient(client!.id, currentAdmin!.adminCode, suspendReason);
    setLoading(false);
    setSuccess('Client has been suspended.');
    setTimeout(() => router.back(), 1600);
  }

  async function doUnsuspend() {
    if (!validateCode()) return;
    setLoading(true);
    await unsuspendClient(client!.id, currentAdmin!.adminCode);
    setLoading(false);
    setSuccess('Client reinstated and visible again.');
    setTimeout(() => router.back(), 1600);
  }

  async function togglePremium() {
    if (!validateCode()) return;
    setLoading(true);
    await setPremium(client!.id, !client!.isPremium);
    setLoading(false);
    setSuccess(client!.isPremium ? 'Premium status removed.' : 'Client is now Premium — listing appears first in search.');
  }

  async function toggleIndebted() {
    if (!validateCode()) return;
    setLoading(true);
    await markIndebted(client!.id, !client!.isIndebted);
    setLoading(false);
    setSuccess(client!.isIndebted ? 'Indebted flag removed. Profile is visible again.' : 'Client flagged as indebted. Profile hidden from public.');
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
          client.status === 'pending'   ? { backgroundColor: Colors.warningLight, borderColor: Colors.warning } :
          client.status === 'approved'  ? { backgroundColor: Colors.successLight, borderColor: Colors.success } :
                                          { backgroundColor: Colors.dangerLight,  borderColor: Colors.danger  }
        ]}>
          <Ionicons
            name={client.status === 'pending' ? 'time' : client.status === 'approved' ? 'checkmark-circle' : 'close-circle'}
            size={18}
            color={client.status === 'pending' ? Colors.warning : client.status === 'approved' ? Colors.success : Colors.danger}
          />
          <Text style={[styles.statusText,
            { color: client.status === 'pending' ? Colors.warning : client.status === 'approved' ? Colors.success : Colors.danger }
          ]}>
            Status: {client.status.toUpperCase()}{client.approvedBy ? ` · By ${client.approvedBy}` : ''}
          </Text>
        </View>

        {/* Inline success / error banners */}
        {success !== '' && (
          <View style={styles.successBanner}>
            <Ionicons name="checkmark-circle" size={16} color={Colors.success} />
            <Text style={styles.successText}>{success}</Text>
          </View>
        )}
        {error !== '' && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={16} color={Colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <Section title="Business Information">
          <Row label="Business Name"    value={client.businessName} />
          <Row label="Client Code"      value={client.clientCode} />
          <Row label="Type"             value={client.type === 'corporate' ? 'Corporate (Registered)' : 'Individual (Unregistered)'} />
          <Row label="Nature of Business" value={client.natureOfBiz} />
          <Row label="CAC Number"       value={client.cacNumber || 'N/A'} />
          <Row label="Competence"       value={client.competence} />
        </Section>

        <Section title="Location">
          <Row label="Country"          value={client.country} />
          <Row label="State"            value={client.state} />
          <Row label="LGA"              value={client.lga} />
          <Row label="City"             value={client.city} />
          <Row label="Area"             value={client.area} />
          <Row label="Town"             value={client.town} />
          <Row label="Address"          value={client.address} />
          <Row label="Nearest Bus Stop" value={client.nearestBusStop} />
          <Row label="Nearest Landmark" value={client.nearestLandmark} />
        </Section>

        <Section title="Contact Details">
          <Row label="Phone"   value={client.phone} />
          <Row label="Email"   value={client.email} />
          <Row label="Website" value={client.websiteLink || 'N/A'} />
        </Section>

        <Section title="Profile & Info">
          <Row label="Profile"         value={client.profile} />
          <Row label="Additional Info" value={client.info || 'N/A'} />
        </Section>

        <Section title="Director / Referral">
          <Row label="Director / Person of Responsibility" value={client.director || 'N/A'} />
          <Row label="Referral / Guarantor"                value={client.referral || 'N/A'} />
          {client.identification && (
            <Row label="Means of Identification" value={`${client.identification.type}: ${client.identification.number}`} />
          )}
        </Section>

        <Section title="Categories">
          <View style={styles.catWrap}>
            {client.categories.map(catId => {
              const cat = getCategoryById(catId);
              return cat ? (
                <View key={catId} style={styles.catTag}>
                  <Ionicons name={cat.icon as any} size={13} color={cat.color} />
                  <Text style={[styles.catTagText, { color: cat.color }]}>{cat.label}</Text>
                </View>
              ) : null;
            })}
          </View>
        </Section>

        <Section title="Subscription & Payment">
          <Row label="Payment Band"        value={payBand?.label ?? `₦${client.paymentBand.toLocaleString()}`} />
          <Row label="Duration"            value={dur?.label ?? `${client.duration} Month(s)`} />
          <Row label="Payment Method"      value={client.paymentMethod.toUpperCase()} />
          <Row label="Registered By (Agent)" value={client.registeredBy} />
          <Row label="Registration Date"   value={new Date(client.registeredAt).toLocaleString()} />
          {client.subscriptionExpiry && (
            <Row label="Subscription Expiry" value={new Date(client.subscriptionExpiry).toLocaleDateString()} />
          )}
        </Section>

        {/* ── PENDING: Approve / Reject ── */}
        {client.status === 'pending' && (
          <View style={styles.actionPanel}>
            <Text style={styles.actionTitle}>Admin Action Required</Text>
            <Text style={styles.actionSub}>
              Verify all details above — confirm subscription is paid, address is valid and landmark exists. Enter your admin code then approve or reject.
            </Text>

            <Text style={styles.fieldLabel}>Your Admin Code *</Text>
            <TextInput
              style={styles.codeInput}
              value={confirmCode}
              onChangeText={t => { setConfirmCode(t); setError(''); }}
              placeholder={`Enter ${currentAdmin.adminCode}`}
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="characters"
            />

            {/* Reject reason */}
            {confirmingReject && (
              <>
                <Text style={styles.fieldLabel}>Rejection Reason *</Text>
                <TextInput
                  style={[styles.codeInput, { height: 80, textAlignVertical: 'top' }]}
                  value={rejectReason}
                  onChangeText={t => { setRejectReason(t); setError(''); }}
                  placeholder="Explain why this registration is being rejected…"
                  placeholderTextColor={Colors.textMuted}
                  multiline
                />
                <View style={styles.actionBtns}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setConfirmingReject(false)}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.rejectBtn} onPress={() => { if (!validateCode()) return; doReject(); }} disabled={loading}>
                    <Ionicons name="close-circle" size={16} color={Colors.white} />
                    <Text style={styles.rejectBtnText}>{loading ? 'Rejecting…' : 'Confirm Reject'}</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {/* Approve confirm */}
            {confirmingApprove && (
              <View style={styles.confirmBox}>
                <Text style={styles.confirmMsg}>
                  Approve "{client.businessName}"? They will become visible on the platform immediately.
                </Text>
                <View style={styles.actionBtns}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setConfirmingApprove(false)}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.approveBtn} onPress={doApprove} disabled={loading}>
                    <Ionicons name="checkmark-circle" size={16} color={Colors.white} />
                    <Text style={styles.approveBtnText}>{loading ? 'Approving…' : 'Yes, Approve'}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {!confirmingApprove && !confirmingReject && (
              <View style={styles.actionBtns}>
                <TouchableOpacity
                  style={styles.rejectOutlineBtn}
                  onPress={() => { if (!validateCode()) return; setConfirmingReject(true); }}
                >
                  <Ionicons name="close-circle" size={18} color={Colors.danger} />
                  <Text style={styles.rejectOutlineBtnText}>Reject</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.approveBtn}
                  onPress={() => { if (!validateCode()) return; setConfirmingApprove(true); }}
                >
                  <Ionicons name="checkmark-circle" size={18} color={Colors.white} />
                  <Text style={styles.approveBtnText}>Approve</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* ── APPROVED: Manage ── */}
        {client.status === 'approved' && (
          <View style={styles.actionPanel}>
            <Text style={styles.actionTitle}>Manage Client</Text>

            <Text style={styles.fieldLabel}>Your Admin Code *</Text>
            <TextInput
              style={styles.codeInput}
              value={confirmCode}
              onChangeText={t => { setConfirmCode(t); setError(''); }}
              placeholder={`Enter ${currentAdmin.adminCode}`}
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="characters"
            />

            {/* Premium toggle */}
            <TouchableOpacity
              style={[styles.toggleBtn, { borderColor: Colors.gold }, client.isPremium && { backgroundColor: Colors.gold }]}
              onPress={togglePremium}
              disabled={loading}
            >
              <Ionicons name="star" size={16} color={client.isPremium ? Colors.white : Colors.gold} />
              <Text style={[styles.toggleBtnText, { color: client.isPremium ? Colors.white : Colors.gold }]}>
                {client.isPremium ? 'Remove Premium Status' : 'Grant Premium Status'}
              </Text>
            </TouchableOpacity>

            {/* Indebted toggle */}
            <TouchableOpacity
              style={[styles.toggleBtn, { borderColor: Colors.accent }, client.isIndebted && { backgroundColor: Colors.accent }]}
              onPress={toggleIndebted}
              disabled={loading}
            >
              <Ionicons name={client.isIndebted ? 'checkmark-circle' : 'alert-circle-outline'} size={16}
                color={client.isIndebted ? Colors.white : Colors.accent} />
              <Text style={[styles.toggleBtnText, { color: client.isIndebted ? Colors.white : Colors.accent }]}>
                {client.isIndebted ? 'Remove Indebted Flag' : 'Mark as Indebted (hides profile)'}
              </Text>
            </TouchableOpacity>

            {/* Suspend */}
            {confirmingSuspend ? (
              <>
                <Text style={[styles.fieldLabel, { marginTop: 8 }]}>Suspension Reason *</Text>
                <TextInput
                  style={[styles.codeInput, { height: 80, textAlignVertical: 'top' }]}
                  value={suspendReason}
                  onChangeText={t => { setSuspendReason(t); setError(''); }}
                  placeholder="Reason for suspension…"
                  placeholderTextColor={Colors.textMuted}
                  multiline
                />
                <View style={styles.actionBtns}>
                  <TouchableOpacity style={styles.cancelBtn} onPress={() => setConfirmingSuspend(false)}>
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.suspendBtn} onPress={() => { if (!validateCode()) return; doSuspend(); }} disabled={loading}>
                    <Ionicons name="ban" size={16} color={Colors.white} />
                    <Text style={styles.suspendBtnText}>{loading ? 'Suspending…' : 'Confirm Suspend'}</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <TouchableOpacity style={styles.suspendOutlineBtn} onPress={() => setConfirmingSuspend(true)}>
                <Ionicons name="ban" size={16} color={Colors.danger} />
                <Text style={styles.suspendOutlineText}>Suspend Client</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* ── SUSPENDED: Unsuspend ── */}
        {client.status === 'suspended' && (
          <View style={styles.actionPanel}>
            <Text style={styles.actionTitle}>Client Suspended</Text>
            <Text style={styles.actionSub}>Suspension reason: {client.suspendedReason}</Text>
            <Text style={styles.fieldLabel}>Your Admin Code *</Text>
            <TextInput
              style={styles.codeInput}
              value={confirmCode}
              onChangeText={t => { setConfirmCode(t); setError(''); }}
              placeholder={`Enter ${currentAdmin.adminCode}`}
              placeholderTextColor={Colors.textMuted}
              autoCapitalize="characters"
            />
            <TouchableOpacity style={styles.approveBtn} onPress={doUnsuspend} disabled={loading}>
              <Ionicons name="checkmark-circle" size={18} color={Colors.white} />
              <Text style={styles.approveBtnText}>{loading ? 'Reinstating…' : 'Reinstate Client'}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── REJECTED ── */}
        {client.status === 'rejected' && (
          <View style={[styles.actionPanel, { backgroundColor: Colors.dangerLight, borderColor: Colors.danger }]}>
            <Text style={[styles.actionSub, { color: Colors.danger }]}>
              This registration has been rejected.
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
  root:         { flex: 1, backgroundColor: Colors.bgLight },
  notFound:     { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  notFoundText: { fontSize: 17, color: Colors.textMedium, fontWeight: '600' },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.primary,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 14, paddingHorizontal: 16,
  },
  backBtn:     { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.white },
  scroll:      { flex: 1 },

  statusBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, margin: 12, borderRadius: 10, padding: 12, borderWidth: 1 },
  statusText:   { fontSize: 13, fontWeight: '700', flex: 1 },

  successBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 12, marginBottom: 4, backgroundColor: Colors.successLight, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: Colors.success },
  successText:   { flex: 1, fontSize: 13, color: Colors.success, fontWeight: '600' },
  errorBanner:   { flexDirection: 'row', alignItems: 'center', gap: 8, marginHorizontal: 12, marginBottom: 4, backgroundColor: Colors.dangerLight, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: Colors.danger },
  errorText:     { flex: 1, fontSize: 13, color: Colors.danger, fontWeight: '600' },

  section: { backgroundColor: Colors.bgCard, margin: 12, marginBottom: 0, borderRadius: 12, padding: 14, borderWidth: 1, borderColor: Colors.borderLight },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: Colors.primary, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5, borderBottomWidth: 1, borderBottomColor: Colors.borderLight, paddingBottom: 6 },
  row: { flexDirection: 'row', marginBottom: 8, gap: 8 },
  rowLabel: { width: 160, fontSize: 12, color: Colors.textLight, fontWeight: '500', flexShrink: 0 },
  rowValue: { flex: 1, fontSize: 13, color: Colors.textDark, fontWeight: '500' },

  catWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  catTag: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: Colors.border, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4 },
  catTagText: { fontSize: 12, fontWeight: '600' },

  actionPanel:   { margin: 12, backgroundColor: Colors.bgCard, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: Colors.border, marginTop: 16 },
  actionTitle:   { fontSize: 16, fontWeight: '800', color: Colors.textDark, marginBottom: 6 },
  actionSub:     { fontSize: 13, color: Colors.textMedium, lineHeight: 18, marginBottom: 14 },
  fieldLabel:    { fontSize: 13, fontWeight: '600', color: Colors.textDark, marginBottom: 5 },
  codeInput: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 12, fontSize: 14,
    color: Colors.textDark, backgroundColor: Colors.bgLight, marginBottom: 12,
  },

  actionBtns: { flexDirection: 'row', gap: 10, marginTop: 4 },

  cancelBtn: { flex: 1, borderWidth: 1.5, borderColor: Colors.border, borderRadius: 12, paddingVertical: 13, alignItems: 'center', justifyContent: 'center' },
  cancelBtnText: { color: Colors.textMedium, fontWeight: '700', fontSize: 14 },

  approveBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: Colors.success, borderRadius: 12, paddingVertical: 13 },
  approveBtnText: { color: Colors.white, fontWeight: '800', fontSize: 14 },

  rejectOutlineBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1.5, borderColor: Colors.danger, borderRadius: 12, paddingVertical: 13, backgroundColor: Colors.dangerLight },
  rejectOutlineBtnText: { color: Colors.danger, fontWeight: '700', fontSize: 14 },

  rejectBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: Colors.danger, borderRadius: 12, paddingVertical: 13 },
  rejectBtnText: { color: Colors.white, fontWeight: '800', fontSize: 14 },

  suspendOutlineBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderWidth: 1.5, borderColor: Colors.danger, borderRadius: 12, paddingVertical: 13, backgroundColor: Colors.dangerLight, marginTop: 10 },
  suspendOutlineText: { color: Colors.danger, fontWeight: '700', fontSize: 14 },

  suspendBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: Colors.danger, borderRadius: 12, paddingVertical: 13 },
  suspendBtnText: { color: Colors.white, fontWeight: '800', fontSize: 14 },

  toggleBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1.5, borderRadius: 12, paddingVertical: 12, paddingHorizontal: 14, marginTop: 10 },
  toggleBtnText: { fontWeight: '700', fontSize: 13, flex: 1 },

  confirmBox: { backgroundColor: Colors.warningLight, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: Colors.warning, marginBottom: 8 },
  confirmMsg: { fontSize: 13, color: Colors.textDark, lineHeight: 18, marginBottom: 10 },
});
