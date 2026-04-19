import 'react-native-gesture-handler';
import React, { useCallback, useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AuthStore } from './src/store/auth';
import { AuthNavigator } from './src/navigation/AuthNavigator';
import { AppNavigator } from './src/navigation/AppNavigator';
import { Colors } from './src/constants/theme';
import { flushQueue } from './src/api/sync';
import NetInfo from '@react-native-community/netinfo';

type AppState = 'loading' | 'auth' | 'app';

export default function App() {
  const [appState, setAppState] = useState<AppState>('loading');

  const checkAuth = useCallback(async () => {
    const ready = await AuthStore.isAuthenticated();
    setAppState(ready ? 'app' : 'auth');
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Auto-flush sync queue when connectivity is restored
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected) {
        flushQueue().catch((err) => {
          console.warn('[App] Auto-flush error:', err);
        });
      }
    });
    return unsubscribe;
  }, []);

  const handleLoginSuccess = useCallback(() => {
    setAppState('app');
  }, []);

  const handleLogout = useCallback(() => {
    setAppState('auth');
  }, []);

  if (appState === 'loading') {
    return (
      <View style={styles.splash}>
        <StatusBar style="dark" backgroundColor={Colors.background} />
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="dark" backgroundColor={Colors.background} />
        {appState === 'auth' ? (
          <AuthNavigator onLoginSuccess={handleLoginSuccess} />
        ) : (
          <AppNavigator onLogout={handleLogout} />
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
