import * as Contacts from 'expo-contacts';
import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import * as SMS from 'expo-sms';
import { Platform } from 'react-native';

export async function ensureContactsPermission() {
  const { status } = await Contacts.requestPermissionsAsync();
  if (status !== Contacts.PermissionStatus.GRANTED) {
    throw new Error('연락처 권한이 필요합니다.');
  }
}

export async function findPhoneNumberByName(name: string): Promise<string | null> {
  await ensureContactsPermission();
  const { data } = await Contacts.getContactsAsync({ fields: [Contacts.Fields.PhoneNumbers] });
  const target = name.trim();
  for (const c of data) {
    const display = [c.name, (c as any).firstName, (c as any).lastName].filter(Boolean).join(' ');
    if (display.includes(target)) {
      const phone = c.phoneNumbers?.[0]?.number;
      if (phone) return phone;
    }
  }
  return null;
}

export async function callPhoneByName(name: string) {
  if (Platform.OS === 'web') throw new Error('웹에서는 전화를 걸 수 없습니다.');
  const number = await findPhoneNumberByName(name);
  const url = number ? `tel:${number}` : undefined;
  if (!url) throw new Error(`${name} 연락처를 찾을 수 없습니다.`);
  await Linking.openURL(url);
}

export async function sendSmsByName(name: string, message: string) {
  if (Platform.OS === 'web') throw new Error('웹에서는 SMS를 보낼 수 없습니다.');
  const number = await findPhoneNumberByName(name);
  if (!number) throw new Error(`${name} 연락처를 찾을 수 없습니다.`);
  const isAvailable = await SMS.isAvailableAsync();
  if (!isAvailable) throw new Error('이 기기에서 SMS를 사용할 수 없습니다.');
  await SMS.sendSMSAsync([number], message);
}

export async function openWebSearch(query: string) {
  const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
  await WebBrowser.openBrowserAsync(url);
}

