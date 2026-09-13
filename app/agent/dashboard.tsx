import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput,
  Platform, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useAppStore } from '../../store/useAppStore';

const FMT = new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 });

export default function AgentDashboard() {
  const router = useRouter();
  const currentAgent = useAppStore(s => s.currentAgent);
  const agentClientLogs = useAppStore(s => s.agentClientLogs);
  const addAgentClientLog = useAppStore(s => s.addAgentClientLog);
  const agentLogout = useAppStore(s => s.agentLogout);

  const [tab, setTab] = useState<'overview' | 'clients' | 'referral'>('overview');
  const [showLogForm, setShowLogForm] = useState(false);
  const [logName, setLogName]         = useState('');
  const [logPhone, setLogPhone]       = useState('');
  const [logFee, setLogFee]           = useState('');
  const [logNotes, setLogNotes]       = useState('');
  const [logSaving, setLogSaving]     = useState(false);
  const [logError, setLogError]       = useState('');
  const [logSuccess, setLogSuccess]   = useState(false);
  const [copied, setCopied]           = useState(false);

  if (!currentAgent) {
    router.replace('/agent/login' as any);
    return null;
  }

  // ── Metrics ───────────────────────────────────────────────────────────────
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const totalLogs = agentClientLogs.length;
  const thisMonthLogs = useMemo(() =>
    agentClientLogs.filter(l => new Date(l.loggedAt) >= startOfMonth).length,
    [agentClientLogs]);
  const totalCommission = useMemo(() =>
    agentClientLogs.reduce((s, l) => s + l.commissionAmount, 0), [agentClientLogs]);
  const pendingPayout = useMemo(() =>
    agentClientLogs.filter(l => l.commissionStatus === 'earned').reduce((s, l) => s + l.commissionAmount, 0),
    [agentClientLogs]);

  const monthlyTarget   = currentAgent.monthlyTarget;
  const wdThreshold     = currentAgent.withdrawalThreshold;
  const monthlyProgress = Math.min(thisMonthLogs / monthlyTarget, 1);
  const wdProgress      = Math.min(totalLogs / wdThreshold, 1);
  const canWithdraw     = totalLogs >= wdThreshold;

  // ── Referral link ─────────────────────────────────────────────────────────
  const referralLink = Platform.OS === 'web' && typeof window !== 'undefined'
    ? `${window.location.origin}/agent/register?ref=${currentAgent.agentCode}`
    : `https://cityhup.app/agent/register?ref=${currentAgent.agentCode}`;

  async function copyLink() {
    try {
      if (Platform.OS === 'web' && navigator.clipboard) {
        await navigator.clipboard.writeText(referralLink);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {}
  }

  async function handleLogSubmit() {
    setLogError('');
    if (!logName.trim()) { setLogError('Client name is required.'); return; }
    const fee = Number(logFee) || 0;
    setLogSaving(true);
    try {
      await addAgentClientLog({
        agentId: currentAgent.id,
        agentCode: currentAgent.agentCode,
        clientName: logName.trim(),
        clientPhone: logPhone.trim() || undefined,
        paymentBand: fee,
        commissionAmount: Number((fee * currentAgent.commissionRate).toFixed(2)),
        commissionStatus: 'pending',
        notes: logNotes.trim() || undefined,
      });
      setLogSuccess(true);
      setLogName(''); setLogPhone(''); setLogFee(''); setLogNotes('');
      setTimeout(() => { setLogSuccess(false); setShowLogForm(false); }, 2000);
    } catch (e: any) {
      setLogError(e.message ?? 'Failed to log client. Try again.');
    } finally {
      setLogSaving(false);
    }
  }

  async function handleLogout() {
    await agentLogout();
    router.replace('/agent/login' as any);
  }

  const statusColor = currentAgent.status === 'approved' ? Colors.success : Colors.warning;
  const statusLabel = currentAgent.status === 'approved' ? 'Active' : currentAgent.status.charAt(0).toUpperCase() + currentAgent.status.slice(1);

  return (
    <View style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{currentAgent.fullName.charAt(0).toUpperCase()}</Text>
          </View>
          <View>
            <Text style={styles.agentName}>{currentAgent.fullName}</Text>
            <Text style={styles.agentCode}>{currentAgent.agentCode}</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '22', borderColor: statusColor + '55' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>{statusLabel}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Ionicons name="log-out-outline" size={20} color="rgba(255,255,255,0.8)" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Tab bar */}
      <View style={styles.tabBar}>
        {(['overview', 'clients', 'referral'] as const).map(t => (
          <TouchableOpacity
            key={t} style={[styles.tabBtn, tab === t && styles.tabBtnActive]}
            onPress={() => setTab(t)}
          >
            <Ionicons
              name={t === 'overview' ? 'grid-outline' : t === 'clients' ? 'people-outline' : 'share-social-outline'}
              size={16}
              color={tab === t ? Colors.primary : Colors.textLight}
            />
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'overview' ? 'Overview' : t === 'clients' ? 'Clients' : 'Referral'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── OVERVIEW TAB ── */}
        {tab === 'overview' && (
          <>
            {/* Stats grid */}
            <View style={styles.statsGrid}>
              <StatCard label="Total Registered" value={String(totalLogs)} icon="people" color={Colors.primary} />
              <StatCard label="This Month" value={String(thisMonthLogs)} icon="calendar" color={Colors.info} />
              <StatCard label="Total Commission" value={FMT.format(totalCommission)} icon="cash" color={Colors.success} />
              <StatCard label="Pending Payout" value={FMT.format(pendingPayout)} icon="hourglass" color={Colors.warning} />
            </View>

            {/* Monthly Target */}
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <View style={styles.progressTitleRow}>
                  <Ionicons name="trophy-outline" size={18} color={Colors.accent} />
                  <Text style={styles.progressTitle}>Monthly Target</Text>
                </View>
                <Text style={styles.progressCount}>{thisMonthLogs} / {monthlyTarget}</Text>
              </View>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${Math.round(monthlyProgress * 100)}%` as any, backgroundColor: Colors.accent }]} />
              </View>
              <Text style={styles.progressNote}>
                {thisMonthLogs >= monthlyTarget
                  ? '🎉 Target reached this month!'
                  : `${monthlyTarget - thisMonthLogs} more client${monthlyTarget - thisMonthLogs !== 1 ? 's' : ''} to reach your monthly target`}
              </Text>
            </View>

            {/* Withdrawal Threshold */}
            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <View style={styles.progressTitleRow}>
                  <Ionicons name="wallet-outline" size={18} color={canWithdraw ? Colors.success : Colors.textLight} />
                  <Text style={styles.progressTitle}>Withdrawal Eligibility</Text>
                </View>
                <Text style={styles.progressCount}>{totalLogs} / {wdThreshold}</Text>
              </View>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${Math.round(wdProgress * 100)}%` as any, backgroundColor: canWithdraw ? Colors.success : Colors.primary }]} />
              </View>
              {canWithdraw ? (
                <View style={styles.withdrawEligible}>
                  <Ionicons name="checkmark-circle" size={15} color={Colors.success} />
                  <Text style={styles.withdrawEligibleText}>You are eligible to request a payout!</Text>
                </View>
              ) : (
                <Text style={styles.progressNote}>
                  Register {wdThreshold - totalLogs} more client{wdThreshold - totalLogs !== 1 ? 's' : ''} to unlock commission withdrawal
                </Text>
              )}
            </View>

            {/* Commission rate info */}
            <View style={styles.infoCard}>
              <Ionicons name="information-circle-outline" size={18} color={Colors.info} />
              <Text style={styles.infoText}>
                Your commission rate is <Text style={styles.infoBold}>{Math.round(currentAgent.commissionRate * 100)}%</Text> per registration fee. Commissions are paid out once your account is verified by admin.
              </Text>
            </View>
          </>
        )}

        {/* ── CLIENTS TAB ── */}
        {tab === 'clients' && (
          <>
            <View style={styles.clientsHeader}>
              <Text style={styles.clientsHeaderText}>{agentClientLogs.length} Client{agentClientLogs.length !== 1 ? 's' : ''} Logged</Text>
              <TouchableOpacity style={styles.addLogBtn} onPress={() => setShowLogForm(v => !v)}>
                <Ionicons name={showLogForm ? 'close' : 'add'} size={18} color={Colors.white} />
                <Text style={styles.addLogBtnText}>{showLogForm ? 'Cancel' : 'Log Client'}</Text>
              </TouchableOpacity>
            </View>

            {/* Log form */}
            {showLogForm && (
              <View style={styles.logForm}>
                <Text style={styles.logFormTitle}>Log a Registered Client</Text>

                {logSuccess && (
                  <View style={styles.successBanner}>
                    <Ionicons name="checkmark-circle" size={15} color={Colors.success} />
                    <Text style={styles.successBannerText}>Client logged successfully!</Text>
                  </View>
                )}
                {logError ? (
                  <View style={styles.errorBanner}>
                    <Ionicons name="alert-circle" size={15} color={Colors.danger} />
                    <Text style={styles.errorText}>{logError}</Text>
                  </View>
                ) : null}

                <Text style={styles.logLabel}>Client Name *</Text>
                <TextInput style={styles.logInput} value={logName} onChangeText={setLogName}
                  placeholder="Full name of registered client" placeholderTextColor={Colors.textMuted} />

                <Text style={styles.logLabel}>Client Phone</Text>
                <TextInput style={styles.logInput} value={logPhone} onChangeText={setLogPhone}
                  keyboardType="phone-pad" placeholder="08012345678" placeholderTextColor={Colors.textMuted} />

                <Text style={styles.logLabel}>Registration Fee (₦)</Text>
                <TextInput style={styles.logInput} value={logFee} onChangeText={setLogFee}
                  keyboardType="numeric" placeholder="e.g. 10000" placeholderTextColor={Colors.textMuted} />
                {logFee && Number(logFee) > 0 && (
                  <Text style={styles.commissionPreview}>
                    Your commission: {FMT.format(Number(logFee) * currentAgent.commissionRate)}
                  </Text>
                )}

                <Text style={styles.logLabel}>Notes</Text>
                <TextInput style={[styles.logInput, { height: 70, textAlignVertical: 'top' }]}
                  value={logNotes} onChangeText={setLogNotes} multiline
                  placeholder="Any additional info..." placeholderTextColor={Colors.textMuted} />

                <TouchableOpacity
                  style={[styles.logSubmitBtn, logSaving && { opacity: 0.6 }]}
                  onPress={handleLogSubmit} disabled={logSaving}
                >
                  {logSaving
                    ? <ActivityIndicator color={Colors.white} />
                    : <><Ionicons name="checkmark-circle" size={18} color={Colors.white} /><Text style={styles.logSubmitText}>Save Log</Text></>}
                </TouchableOpacity>
              </View>
            )}

            {/* Register Full Client button */}
            <TouchableOpacity style={styles.fullRegBtn} onPress={() => router.push(`/register?agentCode=${currentAgent.agentCode}` as any)}>
              <Ionicons name="person-add-outline" size={18} color={Colors.primary} />
              <Text style={styles.fullRegText}>Register a New Client (Full Form)</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textLight} />
            </TouchableOpacity>

            {/* Client log list */}
            {agentClientLogs.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons name="people-outline" size={40} color={Colors.textMuted} />
                <Text style={styles.emptyText}>No clients logged yet.{'\n'}Tap "Log Client" to get started.</Text>
              </View>
            ) : (
              agentClientLogs.map(log => (
                <View key={log.id} style={styles.logRow}>
                  <View style={styles.logAvatar}>
                    <Text style={styles.logAvatarText}>{log.clientName.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={styles.logInfo}>
                    <Text style={styles.logName}>{log.clientName}</Text>
                    {log.clientPhone ? <Text style={styles.logMeta}>{log.clientPhone}</Text> : null}
                    <Text style={styles.logDate}>{new Date(log.loggedAt).toLocaleDateString('en-NG', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
                  </View>
                  <View style={styles.logCommission}>
                    <Text style={styles.logCommissionAmount}>{FMT.format(log.commissionAmount)}</Text>
                    <View style={[styles.commissionBadge, { backgroundColor: log.commissionStatus === 'paid' ? Colors.success + '22' : log.commissionStatus === 'earned' ? Colors.info + '22' : Colors.warning + '22' }]}>
                      <Text style={[styles.commissionBadgeText, { color: log.commissionStatus === 'paid' ? Colors.success : log.commissionStatus === 'earned' ? Colors.info : Colors.warning }]}>
                        {log.commissionStatus}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </>
        )}

        {/* ── REFERRAL TAB ── */}
        {tab === 'referral' && (
          <>
            <View style={styles.referralCard}>
              <View style={styles.referralIconRow}>
                <View style={styles.referralIcon}>
                  <Ionicons name="share-social" size={32} color={Colors.white} />
                </View>
              </View>
              <Text style={styles.referralTitle}>Your Referral Link</Text>
              <Text style={styles.referralSub}>
                Share this link to invite others to become City Hup agents. When they sign up using your link, your referral is recorded.
              </Text>

              <View style={styles.referralCodeBox}>
                <Text style={styles.referralCodeText}>{currentAgent.agentCode}</Text>
                <Text style={styles.referralCodeLabel}>Your Agent Code</Text>
              </View>

              <View style={styles.referralLinkBox}>
                <Text style={styles.referralLinkText} numberOfLines={2}>{referralLink}</Text>
              </View>

              <TouchableOpacity style={[styles.copyBtn, copied && styles.copyBtnDone]} onPress={copyLink}>
                <Ionicons name={copied ? 'checkmark' : 'copy-outline'} size={18} color={Colors.white} />
                <Text style={styles.copyBtnText}>{copied ? 'Copied!' : 'Copy Referral Link'}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoCard}>
              <Ionicons name="people-outline" size={18} color={Colors.info} />
              <Text style={styles.infoText}>
                Agents you recruit with your referral link are tracked under your network. Future reward features for referrals are coming soon.
              </Text>
            </View>

            <View style={styles.agentDetails}>
              <Text style={styles.agentDetailsTitle}>Your Profile</Text>
              <DetailRow label="Name" value={currentAgent.fullName} />
              <DetailRow label="Agent Code" value={currentAgent.agentCode} />
              <DetailRow label="Email" value={currentAgent.email} />
              <DetailRow label="Phone" value={currentAgent.phone} />
              <DetailRow label="State" value={currentAgent.state} />
              <DetailRow label="Account Name" value={currentAgent.accountName || '—'} />
              <DetailRow label="Account Number" value={currentAgent.accountNumber || '—'} />
            </View>
          </>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  return (
    <View style={[statStyles.card, { borderLeftColor: color }]}>
      <Ionicons name={icon as any} size={22} color={color} />
      <Text style={statStyles.value}>{value}</Text>
      <Text style={statStyles.label}>{label}</Text>
    </View>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const statStyles = StyleSheet.create({
  card: {
    flex: 1, minWidth: '46%', backgroundColor: Colors.bgCard,
    borderRadius: 12, padding: 14, borderWidth: 1,
    borderColor: Colors.borderLight, borderLeftWidth: 4,
    gap: 4,
  },
  value: { fontSize: 18, fontWeight: '900', color: Colors.textDark },
  label: { fontSize: 11, color: Colors.textLight, fontWeight: '500' },
});

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgLight },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: Colors.primary,
    paddingTop: Platform.OS === 'ios' ? 52 : 18,
    paddingBottom: 14, paddingHorizontal: 16,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: 18, fontWeight: '800', color: Colors.white },
  agentName: { fontSize: 14, fontWeight: '800', color: Colors.white },
  agentCode: { fontSize: 11, color: 'rgba(255,255,255,0.7)', marginTop: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, borderWidth: 1 },
  statusText: { fontSize: 11, fontWeight: '700' },
  logoutBtn: { padding: 4 },
  tabBar: {
    flexDirection: 'row', backgroundColor: Colors.bgCard,
    borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  tabBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 5, paddingVertical: 12,
    borderBottomWidth: 2, borderBottomColor: 'transparent',
  },
  tabBtnActive: { borderBottomColor: Colors.primary },
  tabText: { fontSize: 12, color: Colors.textLight, fontWeight: '500' },
  tabTextActive: { color: Colors.primary, fontWeight: '700' },
  scroll: { flex: 1 },

  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, padding: 14 },

  progressCard: {
    backgroundColor: Colors.bgCard, marginHorizontal: 14, marginBottom: 12,
    borderRadius: 14, padding: 16, borderWidth: 1, borderColor: Colors.borderLight,
  },
  progressHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  progressTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  progressTitle: { fontSize: 14, fontWeight: '700', color: Colors.textDark },
  progressCount: { fontSize: 14, fontWeight: '800', color: Colors.textDark },
  progressBg: { height: 12, backgroundColor: Colors.borderLight, borderRadius: 6, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 6, minWidth: 4 },
  progressNote: { fontSize: 12, color: Colors.textLight, marginTop: 8 },
  withdrawEligible: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8 },
  withdrawEligibleText: { fontSize: 12, color: Colors.success, fontWeight: '600' },

  infoCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: Colors.infoLight, marginHorizontal: 14, marginBottom: 12,
    borderRadius: 12, padding: 14,
  },
  infoText: { flex: 1, fontSize: 13, color: Colors.info, lineHeight: 20 },
  infoBold: { fontWeight: '800' },

  clientsHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 14,
  },
  clientsHeaderText: { fontSize: 14, fontWeight: '700', color: Colors.textMedium },
  addLogBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: Colors.primary, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8,
  },
  addLogBtnText: { color: Colors.white, fontSize: 13, fontWeight: '700' },

  logForm: {
    backgroundColor: Colors.bgCard, marginHorizontal: 14, marginBottom: 12,
    borderRadius: 14, padding: 16, borderWidth: 1, borderColor: Colors.borderLight,
  },
  logFormTitle: { fontSize: 14, fontWeight: '800', color: Colors.primary, marginBottom: 12 },
  successBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.successLight, borderRadius: 8, padding: 10, marginBottom: 10,
  },
  successBannerText: { fontSize: 13, color: Colors.success, fontWeight: '600' },
  errorBanner: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: Colors.dangerLight, borderRadius: 8, padding: 10, marginBottom: 10,
  },
  errorText: { flex: 1, fontSize: 13, color: Colors.danger },
  logLabel: { fontSize: 12, fontWeight: '600', color: Colors.textMedium, marginBottom: 5, marginTop: 8 },
  logInput: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: 10,
    paddingHorizontal: 13, paddingVertical: 11, fontSize: 14, color: Colors.textDark,
    backgroundColor: Colors.bgLight,
  },
  commissionPreview: {
    fontSize: 12, color: Colors.success, fontWeight: '700', marginTop: 4,
  },
  logSubmitBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 8, backgroundColor: Colors.success, borderRadius: 12, paddingVertical: 13, marginTop: 14,
  },
  logSubmitText: { color: Colors.white, fontWeight: '800', fontSize: 15 },

  fullRegBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: Colors.bgCard, marginHorizontal: 14, marginBottom: 12,
    borderRadius: 12, padding: 14, borderWidth: 1, borderColor: Colors.primary + '44',
  },
  fullRegText: { flex: 1, fontSize: 13, fontWeight: '600', color: Colors.primary },

  empty: { alignItems: 'center', padding: 40, gap: 10 },
  emptyText: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },

  logRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.bgCard, marginHorizontal: 14, marginBottom: 6,
    borderRadius: 12, padding: 12, gap: 10,
    borderWidth: 1, borderColor: Colors.borderLight,
  },
  logAvatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: Colors.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  logAvatarText: { fontSize: 16, fontWeight: '800', color: Colors.primary },
  logInfo: { flex: 1 },
  logName: { fontSize: 14, fontWeight: '700', color: Colors.textDark },
  logMeta: { fontSize: 12, color: Colors.textLight, marginTop: 1 },
  logDate: { fontSize: 11, color: Colors.textMuted, marginTop: 2 },
  logCommission: { alignItems: 'flex-end', gap: 4 },
  logCommissionAmount: { fontSize: 13, fontWeight: '800', color: Colors.textDark },
  commissionBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  commissionBadgeText: { fontSize: 10, fontWeight: '700', textTransform: 'capitalize' },

  referralCard: {
    backgroundColor: Colors.bgCard, margin: 14, borderRadius: 16, padding: 20,
    alignItems: 'center', borderWidth: 1, borderColor: Colors.borderLight,
  },
  referralIconRow: { marginBottom: 14 },
  referralIcon: {
    width: 70, height: 70, borderRadius: 35,
    backgroundColor: Colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  referralTitle: { fontSize: 18, fontWeight: '900', color: Colors.textDark, marginBottom: 8 },
  referralSub: { fontSize: 13, color: Colors.textMedium, textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  referralCodeBox: {
    backgroundColor: Colors.primaryLight, borderRadius: 12, padding: 14,
    alignItems: 'center', marginBottom: 12, width: '100%',
  },
  referralCodeText: { fontSize: 20, fontWeight: '900', color: Colors.primary, letterSpacing: 1 },
  referralCodeLabel: { fontSize: 11, color: Colors.textLight, marginTop: 2 },
  referralLinkBox: {
    backgroundColor: Colors.bgLight, borderRadius: 10, padding: 12,
    marginBottom: 14, width: '100%', borderWidth: 1, borderColor: Colors.border,
  },
  referralLinkText: { fontSize: 12, color: Colors.textMedium, lineHeight: 18 },
  copyBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: Colors.primary, borderRadius: 12, paddingHorizontal: 24, paddingVertical: 13,
  },
  copyBtnDone: { backgroundColor: Colors.success },
  copyBtnText: { color: Colors.white, fontWeight: '800', fontSize: 14 },

  agentDetails: {
    backgroundColor: Colors.bgCard, marginHorizontal: 14, marginTop: 4, marginBottom: 12,
    borderRadius: 14, padding: 16, borderWidth: 1, borderColor: Colors.borderLight,
  },
  agentDetailsTitle: { fontSize: 14, fontWeight: '800', color: Colors.textDark, marginBottom: 12 },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  detailLabel: { fontSize: 13, color: Colors.textLight },
  detailValue: { fontSize: 13, color: Colors.textDark, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
});
