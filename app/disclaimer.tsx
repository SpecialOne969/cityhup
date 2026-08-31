import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

export default function DisclaimerScreen() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Disclaimer & Terms</Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.logoRow}>
            <Text style={styles.logo}>CITY<Text style={{ color: Colors.accent }}>HUP</Text></Text>
            <Text style={styles.logoSub}>Your Neighborhood Directory</Text>
          </View>

          <Section title="Disclaimer">
            <Para>
              CityHup Ltd provides this directory platform solely as an information service to connect service providers and consumers within Nigeria. The information contained on this platform is provided in good faith by registered agents and the service providers themselves.
            </Para>
            <Para>
              CityHup Ltd does not warrant or represent, expressly or by implication, the accuracy of any information on this platform. Listings are verified to the best ability of our agents, but CityHup Ltd shall not be held liable for any loss, damage, or inconvenience arising from reliance on any information found here.
            </Para>
          </Section>

          <Section title="Terms & Conditions of Use">
            <BulletItem text="This platform is for informational purposes only. CityHup Ltd is not a party to any transaction between users and service providers." />
            <BulletItem text="All service providers listed are independent businesses. CityHup Ltd does not endorse any individual or company listed." />
            <BulletItem text="Users are advised to exercise due diligence before engaging any service provider found on this platform." />
            <BulletItem text="CityHup Ltd reserves the right to suspend or remove any listing that violates our community standards or is found to be fraudulent." />
            <BulletItem text="Service providers are responsible for the accuracy of the information they provide. CityHup agents verify information at time of registration but cannot guarantee ongoing accuracy." />
            <BulletItem text="Disputes between users and service providers must be resolved between the parties. CityHup Ltd may assist in mediation but is not obligated to do so." />
            <BulletItem text="Subscription fees are non-refundable once a listing is approved and made live on the platform." />
            <BulletItem text="Listings may be suspended for non-payment of subscription fees, violation of terms, or at the discretion of CityHup Ltd administrators." />
          </Section>

          <Section title="Service Provider Obligations">
            <BulletItem text="Provide accurate and up-to-date business information." />
            <BulletItem text="Maintain valid identification and CAC registration (for corporate clients) at all times." />
            <BulletItem text="Renew subscriptions before expiry to maintain active listing status." />
            <BulletItem text="Respond promptly to customer inquiries and complaints." />
            <BulletItem text="Notify CityHup agents of any changes to business address, contact details, or services offered." />
            <BulletItem text="Profiles cannot be updated remotely by the client — all updates must go through an authorized CityHup agent." />
          </Section>

          <Section title="Privacy Policy">
            <Para>
              CityHup Ltd is committed to protecting your personal information. Data collected during registration is used solely for the purpose of creating and managing your directory listing. We do not sell or share your personal data with third parties without your consent, except as required by law.
            </Para>
            <Para>
              Identification documents (NIN, Driver's License, Voters Card, International Passport, or Artisan Union ID) are collected for verification purposes only and are stored securely.
            </Para>
          </Section>

          <Section title="Limitation of Liability">
            <Para>
              To the maximum extent permitted by applicable law, CityHup Ltd shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, arising out of or in connection with the use of this platform.
            </Para>
          </Section>

          <Section title="Governing Law">
            <Para>
              These terms are governed by the laws of the Federal Republic of Nigeria. Any disputes shall be subject to the exclusive jurisdiction of the Nigerian courts.
            </Para>
          </Section>

          <View style={styles.footer}>
            <Text style={styles.footerText}>© 2026 City Hup Ltd. All rights reserved.</Text>
            <Text style={styles.footerText}>Lagos, Lagos State, Nigeria.</Text>
            <Text style={styles.footerText}>Last updated: July 2026</Text>
          </View>
        </View>
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

function Para({ children }: { children: string }) {
  return <Text style={styles.para}>{children}</Text>;
}

function BulletItem({ text }: { text: string }) {
  return (
    <View style={styles.bulletRow}>
      <Text style={styles.bullet}>•</Text>
      <Text style={styles.bulletText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.bgLight },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: Colors.primary,
    paddingTop: Platform.OS === 'ios' ? 50 : 16,
    paddingBottom: 14, paddingHorizontal: 16,
  },
  backBtn: { padding: 4 },
  headerTitle: { fontSize: 17, fontWeight: '700', color: Colors.white },
  scroll: { flex: 1 },
  content: { padding: 20 },
  logoRow: { alignItems: 'center', marginBottom: 24, paddingVertical: 16 },
  logo: { fontSize: 28, fontWeight: '900', color: Colors.primaryDark, letterSpacing: 2 },
  logoSub: { fontSize: 12, color: Colors.textLight, marginTop: 4 },
  section: { marginBottom: 24 },
  sectionTitle: {
    fontSize: 15, fontWeight: '800', color: Colors.primary,
    marginBottom: 10, borderBottomWidth: 2, borderBottomColor: Colors.primaryLight,
    paddingBottom: 6,
  },
  para: { fontSize: 13, color: Colors.textMedium, lineHeight: 21, marginBottom: 10 },
  bulletRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  bullet: { fontSize: 14, color: Colors.primary, marginTop: 1 },
  bulletText: { flex: 1, fontSize: 13, color: Colors.textMedium, lineHeight: 20 },
  footer: { borderTopWidth: 1, borderTopColor: Colors.border, paddingTop: 16, marginTop: 8, alignItems: 'center', gap: 4 },
  footerText: { fontSize: 12, color: Colors.textLight },
});
