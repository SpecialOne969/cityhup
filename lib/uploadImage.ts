import { supabase } from './supabase';
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
  path: string
): Promise<string> {
  const response = await fetch(uri);
  const blob = await response.blob();
  const ext = (uri.split('.').pop() ?? 'jpg').toLowerCase().split('?')[0];
  const contentType = ext === 'png' ? 'image/png' : ext === 'gif' ? 'image/gif' : 'image/jpeg';

  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, blob, { contentType, upsert: true });

  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadImages(
  uris: string[],
  bucket: string,
  folder: string
): Promise<string[]> {
  const urls: string[] = [];
  for (let i = 0; i < uris.length; i++) {
    const uri = uris[i];
    if (uri.startsWith('http')) {
      urls.push(uri);
      continue;
    }
    const ext = (uri.split('.').pop() ?? 'jpg').toLowerCase().split('?')[0];
    const path = `${folder}/${Date.now()}_${i}.${ext}`;
    const url = await uploadImage(uri, bucket, path);
    urls.push(url);
  }
  return urls;
}
