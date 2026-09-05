import { supabase } from './supabase';
import { validateUpload, ALLOWED_IMAGE_TYPES } from './security';
import * as ImagePicker from 'expo-image-picker';
import { Platform } from 'react-native';

export async function pickImages(multiSelect = false): Promise<string[]> {
  if (Platform.OS !== 'web') {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') throw new Error('Camera roll permission not granted');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: multiSelect,
    quality: 0.8,
    base64: false,
  });

  if (result.canceled) return [];
  return result.assets.map(a => a.uri);
}

export async function uploadImage(
  uri: string,
  bucket: string,
  _ignoredPath: string   // caller-supplied path is ignored — we generate a safe UUID path
): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();

  // ── Security: validate type and size ──────────────────────────────────────
  const validation = validateUpload(blob);
  if (!validation.ok) throw new Error(validation.reason);

  // Derive extension from validated MIME type
  const mimeToExt: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png':  'png',
    'image/webp': 'webp',
    'image/gif':  'gif',
  };
  const ext = mimeToExt[blob.type] ?? 'jpg';

  // ── Security: UUID filename — no predictable paths ─────────────────────
  const safePath = `uploads/${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage
    .from(bucket)
    .upload(safePath, blob, { contentType: blob.type, upsert: false });

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(safePath);
  return data.publicUrl;
}

export async function uploadImages(
  uris: string[],
  bucket: string,
  _folder?: string       // ignored — kept for API compatibility
): Promise<string[]> {
  const urls: string[] = [];
  for (const uri of uris) {
    if (uri.startsWith('http')) {
      // Already a remote URL — validate it comes from our own Supabase bucket
      const supabaseHost = process.env.EXPO_PUBLIC_SUPABASE_URL?.replace('https://', '');
      if (supabaseHost && uri.includes(supabaseHost)) {
        urls.push(uri);
      }
      // Silently drop URLs from unknown hosts
      continue;
    }
    const url = await uploadImage(uri, bucket, '');
    urls.push(url);
  }
  return urls;
}

/** Check if a file MIME type is permitted before even picking. */
export function isMimeAllowed(type: string): boolean {
  return ALLOWED_IMAGE_TYPES.includes(type);
}
