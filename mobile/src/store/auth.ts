import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const TOKEN_KEY = 'sakapuss_token';
const USER_KEY = 'sakapuss_user';
const BASE_URL_KEY = 'sakapuss_base_url';
const GUEST_KEY = 'sakapuss_guest';

export interface User {
  id: string;
  email: string;
  display_name: string;
  role: string;
}

export const AuthStore = {
  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_KEY);
  },

  async setToken(token: string): Promise<void> {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  },

  async getUser(): Promise<User | null> {
    const raw = await AsyncStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  },

  async setUser(user: User): Promise<void> {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  async getBaseUrl(): Promise<string> {
    const saved = await AsyncStorage.getItem(BASE_URL_KEY);
    if (saved) return saved;
    // Android emulator accesses WSL2 host via 10.0.2.2; other platforms use localhost
    return Platform.OS === 'android' ? 'http://10.0.2.2:8000' : 'http://localhost:8000';
  },

  async setBaseUrl(url: string): Promise<void> {
    await AsyncStorage.setItem(BASE_URL_KEY, url);
  },

  async setGuestMode(): Promise<void> {
    await AsyncStorage.setItem(GUEST_KEY, '1');
  },

  async isGuestMode(): Promise<boolean> {
    const val = await AsyncStorage.getItem(GUEST_KEY);
    return val === '1';
  },

  async logout(): Promise<void> {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY, GUEST_KEY]);
  },

  async isLoggedIn(): Promise<boolean> {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    return token !== null && token.length > 0;
  },

  async isAuthenticated(): Promise<boolean> {
    const loggedIn = await AuthStore.isLoggedIn();
    const guest = await AuthStore.isGuestMode();
    return loggedIn || guest;
  },
};
