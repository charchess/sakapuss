import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthStore } from '../../src/store/auth';

beforeEach(async () => {
  await AsyncStorage.clear();
  jest.clearAllMocks();
});

describe('AuthStore', () => {
  it('setToken + getToken stores and retrieves correctly', async () => {
    await AuthStore.setToken('my-token');
    const token = await AuthStore.getToken();
    expect(token).toBe('my-token');
  });

  it('getToken returns null when nothing stored', async () => {
    const token = await AuthStore.getToken();
    expect(token).toBeNull();
  });

  it('isLoggedIn returns false when no token', async () => {
    const result = await AuthStore.isLoggedIn();
    expect(result).toBe(false);
  });

  it('isLoggedIn returns true after setToken', async () => {
    await AuthStore.setToken('abc');
    const result = await AuthStore.isLoggedIn();
    expect(result).toBe(true);
  });

  it('setUser + getUser stores and retrieves a User object', async () => {
    const user = { id: '1', email: 'test@test.com', display_name: 'Test', role: 'user' };
    await AuthStore.setUser(user);
    const retrieved = await AuthStore.getUser();
    expect(retrieved).toEqual(user);
  });

  it('getUser returns null when nothing stored', async () => {
    const user = await AuthStore.getUser();
    expect(user).toBeNull();
  });

  it('getUser returns null on invalid JSON in storage', async () => {
    await AsyncStorage.setItem('sakapuss_user', 'not-json{{{');
    const user = await AuthStore.getUser();
    expect(user).toBeNull();
  });

  it('logout clears both token and user', async () => {
    await AuthStore.setToken('tok');
    await AuthStore.setUser({ id: '1', email: 'a@a.com', display_name: 'A', role: 'user' });
    await AuthStore.logout();
    expect(await AuthStore.getToken()).toBeNull();
    expect(await AuthStore.getUser()).toBeNull();
  });

  it("getBaseUrl returns 'http://localhost:8000' by default", async () => {
    const url = await AuthStore.getBaseUrl();
    expect(url).toBe('http://localhost:8000');
  });

  it('setBaseUrl + getBaseUrl stores and retrieves', async () => {
    await AuthStore.setBaseUrl('http://192.168.1.100:8000');
    const url = await AuthStore.getBaseUrl();
    expect(url).toBe('http://192.168.1.100:8000');
  });
});
