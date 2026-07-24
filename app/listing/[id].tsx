import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert, TextInput, Modal,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { getCategoryById } from '../../constants/categories';
import { useAppStore } from '../../store/useAppStore';

export default function ListingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const clients = useAppStore(s => s.clients);
  const client = clients.find(c => c.id === (id ?? ''));
  const addComplaint = useAppStore(s => s.addComplaint);

  const [showComplaint, setShowComplaint] = useState(false);
  const [complainName, setComplainName] = useState('');
  const [complainPhone, setComplainPhone] = useState('');
  const [complainDesc, setComplainDesc] = useState('');

  if (!client) {
    return (
      <View style={styles.notFound}>
        <Ionicons name="alert-circle-outline" size={52} color={Colors.textMuted} />
        <Text style={styles.notFoundText}>Listing not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const primaryCat = getCategoryById(client.categories[0]);

  function handleCall() {
    Linking.openURL(`tel:${client.phone}`);
  }

  function handleEmail() {
    Linking.openURL(`mailto:${client.email}`);
  }

  function handleWebsite() {
    if (client.websiteLink) Linking.openURL(client.websiteLink);
  }

  function handleMap() {
    const query = encodeURIComponent(`${client.address}, ${client.nearestLandmark}, ${client.city}, ${client.state}, Nigeria`);
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${query}`);
  }

  function submitComplaint() {
    if (!complainName || !complainPhone || !complainDesc) {
      Alert.alert('Missing info', 'Please fill all fields');
      return;
    }
    addComplaint({
      clientId: client.id,
      reporterName: complainName,
      reporterPhone: complainPhone,
      description: complainDesc,
    });
    Alert.alert('Submitted', 'Your complaint has been recorded and will be reviewed.');
    setShowComplaint(false);
    setComplainName('');
    setComplainPhone('');
    setComplainDesc('');
  }

  return (
    <View style={styles.root}>
      {/* Hero / Category strip */}
      <View style={[styles.hero, { backgroundColor: primaryCat?.color ?? Colors.primary }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.heroBack}>
          <Ionicons name="arrow-back" size={22} color={Colors.white} />
        </TouchableOpacity>
        <View style={styles.heroContent}>
          <Ionicons name={(primaryCat?.icon ?? 'business') as any} size={36} color="rgba(255,255,255,0.6)" />
          <View style={styles.heroText}>
            <Text style={styles.heroName}>{client.businessName}</Text>
            <Text style={styles.heroCat}>{primaryCat?.label}</Text>
            <View style={styles.heroMeta}>
              <View style={[styles.heroBadge, { backgroundColor: client.type === 'corporate' ? Colors.gold : 'rgba(255,255,255,0.3)' }]}>
                <Text style={styles.heroBadgeText}>{client.type === 'corporate' ? 'Corporate' : 'Individual'}</Text>
              </View>
              <View style={[styles.heroBadge, { backgroundColor: Colors.successLight }]}>
                <Ionicons name="checkmark-circle" size={11} color={Colors.success} />
                <Text style={[styles.heroBadgeText, { color: Colors.success }]}>Verified</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Rating */}
        {client.rating != null && (
          <View style={styles.ratingStrip}>
            {[1,2,3,4,5].map(s => (
              <Ionicons
                key={s}
                name={s <= Math.round(client.rating!) ? 'star' : 'star-outline'}
                size={18}
                color={Colors.gold}
              />
            ))}
            <Text style={styles.ratingVal}>{client.rating.toFixed(1)}</Text>
            <Text style={styles.ratingCount}>({client.reviewCount} reviews)</Text>
          </View>
        )}

        {/* Suspended banner */}
        {client.isIndebted && (
          <View style={[styles.ratingStrip, { backgroundColor: Colors.warningLight }]}>
            <Ionicons name="alert-circle" size={16} color={Colors.warning} />
            <Text style={{ color: Colors.warning, fontSize: 12, fontWeight: '600' }}>
              This provider's account has a pending payment issue. Contact City Hup for assistance.
            </Text>
          </View>
        )}

        {/* Contact actions */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.primary }]} onPress={handleCall}>
            <Ionicons name="call" size={18} color={Colors.white} />
            <Text style={styles.actionBtnText}>Call</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.info }]} onPress={handleEmail}>
            <Ionicons name="mail" size={18} color={Colors.white} />
            <Text style={styles.actionBtnText}>Email</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: '#34A853' }]} onPress={handleMap}>
            <Ionicons name="map" size={18} color={Colors.white} />
            <Text style={styles.actionBtnText}>Map</Text>
          </TouchableOpacity>
          {client.websiteLink ? (
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: Colors.accent }]} onPress={handleWebsite}>
              <Ionicons name="globe" size={18} color={Colors.white} />
              <Text style={styles.actionBtnText}>Website</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Info cards */}
        <InfoCard title="About">
          <Text style={styles.infoText}>{client.profile}</Text>
          {client.info ? <Text style={[styles.infoText, { marginTop: 8 }]}>{client.info}</Text> : null}
        </InfoCard>

        <InfoCard title="Location">
          <InfoRow icon="location" label="Address" value={client.address} />
          <InfoRow icon="map" label="Area" value={`${client.area}, ${client.city}, ${client.state}`} />
          <InfoRow icon="bus" label="Nearest Bus Stop" value={client.nearestBusStop} />
          <InfoRow icon="flag" label="Nearest Landmark" value={client.nearestLandmark} />
          {client.lga ? <InfoRow icon="location-outline" label="LGA" value={client.lga} /> : null}
        </InfoCard>

        <InfoCard title="Contact Details">
          <InfoRow icon="call" label="Phone" value={client.phone} />
          <InfoRow icon="mail" label="Email" value={client.email} />
          {client.websiteLink ? <InfoRow icon="globe" label="Website" value={client.websiteLink} /> : null}
        </InfoCard>

        <InfoCard title="Business Details">
          <InfoRow icon="briefcase" label="Nature of Business" value={client.natureOfBiz} />
          <InfoRow icon="build" label="Competence" value={client.competence} />
          {client.cacNumber ? <InfoRow icon="document-text" label="CAC Number" value={client.cacNumber} /> : null}
          {client.director ? <InfoRow icon="person" label="Director / Person of Responsibility" value={client.director} /> : null}
        </InfoCard>

        {/* Shelf items (for super stores) */}
        {client.shelfItems && client.shelfItems.length > 0 && (
          <InfoCard title="Products / Offers on Shelf">
            {client.shelfItems.map(item => (
              <View key={item.id} style={styles.shelfItem}>
                <View style={styles.shelfItemLeft}>
                  <Text style={styles.shelfItemName}>{item.name}</Text>
                  {item.description ? <Text style={styles.shelfItemDesc}>{item.description}</Text> : null}
                </View>
                <View style={styles.shelfItemRight}>
                  <Text style={styles.shelfItemPrice}>₦{item.price.toLocaleString()}</Text>
                  {item.isOffer && (
                    <View style={styles.offerBadge}><Text style={styles.offerBadgeText}>OFFER</Text></View>
                  )}
                </View>
              </View>
            ))}
          </InfoCard>
        )}

        <InfoCard title="Client Reference">
          <InfoRow icon="card" label="Client Code" value={client.clientCode} />
          <InfoRow icon="time" label="Listed Since" value={new Date(client.registeredAt).toLocaleDateString('en-NG', { year: 'numeric', month: 'long', day: 'numeric' })} />
          {client.referral ? <InfoRow icon="people" label="Referral / Guarantor" value={client.referral} /> : null}
        </InfoCard>

        {/* Complaint button */}
        <TouchableOpacity style={styles.complainBtn} onPress={() => setShowComplaint(true)}>
          <Ionicons name="alert-circle-outline" size={16} color={Colors.danger} />
          <Text style={styles.complainBtnText}>Report / Complaint</Text>
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Complaint Modal */}
      <Modal visible={showComplaint} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Submit a Complaint</Text>
              <TouchableOpacity onPress={() => setShowComplaint(false)}>
                <Ionicons name="close" size={22} color={Colors.textMedium} />
              </TouchableOpacity>
            </View>
            <TextInput style={styles.modalInput} placeholder="Your Name" value={complainName} onChangeText={setComplainName} />
            <TextInput style={styles.modalInput} placeholder="Your Phone Number" value={complainPhone} onChangeText={setComplainPhone} keyboardType="phone-pad" />
            <TextInput
              style={[styles.modalInput, { height: 90, textAlignVertical: 'top' }]}
              placeholder="Describe the issue…"
              value={complainDesc}
              onChangeText={setComplainDesc}
              multiline
            />
            <TouchableOpacity style={styles.modalSubmit} onPress={submitComplaint}>
              <Text style={styles.modalSubmitText}>Submit Complaint</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function InfoCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.infoCard}>
      <Text style={styles.infoCardTitle}>{title}</Text>
      {children}
    </View>
  );
}

function InfoRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  if (!value) return null;
  return (
    <View style={styles.infoRow}>
      <Ionicons name={icon as any} size={14} color={Colors.primary} style={{ marginTop: 2 }} />
      <View style={styles.infoRowText}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgLight },
  notFound: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  notFoundText: { fontSize: 18, color: Colors.textMedium, fontWeight: '700' },
  backBtn: { backgroundColor: Colors.primary, borderRadius: 8, paddingHorizontal: 20, paddingVertical: 10 },
  backBtnText: { color: Colors.white, fontWeight: '700' },

  hero: { paddingTop: 48, paddingBottom: 20, paddingHorizontal: 16 },
  heroBack: { position: 'absolute', top: 48, left: 16, zIndex: 10, padding: 4 },
  heroContent: { flexDirection: 'row', alignItems: 'flex-start', gap: 14, paddingTop: 8 },
  heroText: { flex: 1 },
  heroName: { fontSize: 20, fontWeight: '900', color: Colors.white, lineHeight: 26 },
  heroCat: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginBottom: 8 },
  heroMeta: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  heroBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  heroBadgeText: { fontSize: 10, fontWeight: '700', color: Colors.textDark },

  scroll: { flex: 1 },
  ratingStrip: {
    flexDirection: 'row', alignItems: 'center', gap: 3,
    padding: 12, backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  ratingVal: { fontSize: 15, fontWeight: '700', color: Colors.textDark, marginLeft: 4 },
  ratingCount: { fontSize: 12, color: Colors.textLight },

  actionRow: {
    flexDirection: 'row', gap: 10, padding: 16,
    backgroundColor: Colors.bgCard, borderBottomWidth: 1, borderBottomColor: Colors.border,
  },
  actionBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, borderRadius: 10, paddingVertical: 12,
  },
  actionBtnText: { color: Colors.white, fontWeight: '700', fontSize: 13 },

  infoCard: {
    backgroundColor: Colors.bgCard, margin: 12, marginBottom: 0, borderRadius: 12,
    padding: 14, borderWidth: 1, borderColor: Colors.borderLight,
  },
  infoCardTitle: { fontSize: 14, fontWeight: '700', color: Colors.textDark, marginBottom: 10, borderBottomWidth: 1, borderBottomColor: Colors.borderLight, paddingBottom: 6 },
  infoRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  infoRowText: { flex: 1 },
  infoLabel: { fontSize: 11, color: Colors.textLight, marginBottom: 1 },
  infoValue: { fontSize: 13, color: Colors.textDark, fontWeight: '500' },
  infoText: { fontSize: 13, color: Colors.textMedium, lineHeight: 20 },

  shelfItem: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: Colors.borderLight,
  },
  shelfItemLeft: { flex: 1 },
  shelfItemName: { fontSize: 13, fontWeight: '600', color: Colors.textDark },
  shelfItemDesc: { fontSize: 11, color: Colors.textLight, marginTop: 2 },
  shelfItemRight: { alignItems: 'flex-end', gap: 4 },
  shelfItemPrice: { fontSize: 14, fontWeight: '700', color: Colors.primary },
  offerBadge: { backgroundColor: Colors.danger, borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
  offerBadgeText: { color: Colors.white, fontSize: 9, fontWeight: '800' },

  complainBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    margin: 16, borderWidth: 1, borderColor: Colors.danger, borderRadius: 10,
    paddingVertical: 12, backgroundColor: Colors.dangerLight,
  },
  complainBtnText: { color: Colors.danger, fontWeight: '600', fontSize: 13 },

  modalOverlay: { flex: 1, backgroundColor: Colors.overlay, justifyContent: 'flex-end' },
  modal: { backgroundColor: Colors.bgCard, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 16, fontWeight: '700', color: Colors.textDark },
  modalInput: {
    borderWidth: 1, borderColor: Colors.border, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, marginBottom: 10, color: Colors.textDark,
  },
  modalSubmit: {
    backgroundColor: Colors.danger, borderRadius: 10, paddingVertical: 14, alignItems: 'center', marginTop: 4,
  },
  modalSubmitText: { color: Colors.white, fontWeight: '700', fontSize: 15 },
});
