import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Colors } from '../constants/colors';
import { useAppStore } from '../store/useAppStore';

export default function RootLayout() {
  const restoreSession = useAppStore(s => s.restoreSession);

  useEffect(() => {
    restoreSession();
  }, []);

  return (
    <>
      <StatusBar style="light" backgroundColor={Colors.primary} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="search" />
        <Stack.Screen name="browse/index" />
        <Stack.Screen name="browse/[category]" />
        <Stack.Screen name="listing/[id]" />
        <Stack.Screen name="register/index" />
        <Stack.Screen name="admin/login" />
        <Stack.Screen name="admin/dashboard" />
        <Stack.Screen name="admin/approve/[id]" />
        <Stack.Screen name="admin/ads" />
        <Stack.Screen name="disclaimer" />
        <Stack.Screen name="customer-register" />
        <Stack.Screen name="customer-login" />
        <Stack.Screen name="customer-dashboard" />
        <Stack.Screen name="client-login" />
        <Stack.Screen name="client-dashboard" />
      </Stack>
    </>
  );
}
