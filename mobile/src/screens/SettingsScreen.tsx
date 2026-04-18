import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Colors, Radius, Spacing, Shadow, Typography } from '../constants/theme';
import { AuthStore, User } from '../store/auth';
import { SyncQueue } from '../store/syncQueue';
import { DEFAULT_BASE_URL } from '../constants/api';

interface Props {
  onLogout: () => void;
}

export function SettingsScreen({ onLogout }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE_URL);
  const [editingUrl, setEditingUrl] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const load = async () => {
      const [u, url, count] = await Promise.all([
        AuthStore.getUser(),
        AuthStore.getBaseUrl(),
        SyncQueue.getPendingCount(),
      ]);
      setUser(u);
      setBaseUrl(url);
      setUrlDraft(url);
      setPendingCount(count);
    };
    load();
    const unsub = SyncQueue.subscribe(async () => {
      setPendingCount(await SyncQueue.getPendingCount());
    });
    return unsub;
  }, []);

  const handleSaveUrl = async () => {
    const trimmed = urlDraft.trim().replace(/\/$/, '');
    if (!trimmed) {
      Alert.alert('URL invalide', 'Veuillez saisir une URL valide.');
      return;
    }
    await AuthStore.setBaseUrl(trimmed);
    setBaseUrl(trimmed);
    setEditingUrl(false);
    Alert.alert('Sauvegardé', 'URL du serveur mise à jour.');
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Déconnecter',
          style: 'destructive',
          onPress: async () => {
            await AuthStore.logout();
            onLogout();
          },
        },
      ]
    );
  };

  const handleClearQueue = () => {
    Alert.alert(
      'Vider la file',
      'Supprimer tous les événements en attente de synchronisation ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Vider',
          style: 'destructive',
          onPress: () => SyncQueue.clear(),
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" backgroundColor={Colors.background} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Paramètres</Text>

        {/* User info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compte</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowIcon}>👤</Text>
              <View style={styles.rowBody}>
                <Text style={styles.rowLabel}>Nom</Text>
                <Text style={styles.rowValue}>{user?.display_name ?? '—'}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.rowIcon}>📧</Text>
              <View style={styles.rowBody}>
                <Text style={styles.rowLabel}>Email</Text>
                <Text style={styles.rowValue}>{user?.email ?? '—'}</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <Text style={styles.rowIcon}>🔑</Text>
              <View style={styles.rowBody}>
                <Text style={styles.rowLabel}>Rôle</Text>
                <Text style={styles.rowValue}>{user?.role ?? '—'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Server URL */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Serveur</Text>
          <View style={styles.card}>
            {editingUrl ? (
              <>
                <Text style={styles.fieldLabel}>URL du serveur</Text>
                <TextInput
                  style={styles.input}
                  value={urlDraft}
                  onChangeText={setUrlDraft}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="url"
                  placeholder="http://localhost:8000"
                  placeholderTextColor={Colors.textMuted}
                />
                <View style={styles.urlActions}>
                  <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={handleSaveUrl}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.saveBtnText}>Sauvegarder</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => {
                      setUrlDraft(baseUrl);
                      setEditingUrl(false);
                    }}
                  >
                    <Text style={styles.cancelBtnText}>Annuler</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <TouchableOpacity
                style={styles.row}
                onPress={() => setEditingUrl(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.rowIcon}>🌐</Text>
                <View style={styles.rowBody}>
                  <Text style={styles.rowLabel}>URL du serveur</Text>
                  <Text style={styles.rowValue} numberOfLines={1}>{baseUrl}</Text>
                </View>
                <Text style={styles.editHint}>Modifier ›</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Sync info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Synchronisation</Text>
          <View style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.rowIcon}>📤</Text>
              <View style={styles.rowBody}>
                <Text style={styles.rowLabel}>Événements en attente</Text>
                <Text style={[styles.rowValue, pendingCount > 0 && { color: Colors.accent }]}>
                  {pendingCount} événement{pendingCount !== 1 ? 's' : ''}
                </Text>
              </View>
            </View>
            {pendingCount > 0 && (
              <>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.row} onPress={handleClearQueue}>
                  <Text style={styles.rowIcon}>🗑️</Text>
                  <View style={styles.rowBody}>
                    <Text style={[styles.rowLabel, { color: Colors.error }]}>
                      Vider la file de sync
                    </Text>
                  </View>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Logout */}
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutIcon}>🚪</Text>
            <Text style={styles.logoutText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>Sakapuss Mobile v1.0.0</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: Spacing.xl,
    paddingBottom: 48,
  },
  title: {
    ...Typography.h2,
    marginBottom: Spacing.xl,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.sm,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    ...Shadow.card,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  rowIcon: {
    fontSize: 20,
    marginRight: Spacing.md,
    width: 28,
    textAlign: 'center',
  },
  rowBody: {
    flex: 1,
  },
  rowLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  rowValue: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '600',
    marginTop: 2,
  },
  editHint: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 56,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
    marginHorizontal: Spacing.lg,
  },
  urlActions: {
    flexDirection: 'row',
    padding: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  saveBtn: {
    flex: 1,
    marginRight: 10,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 10,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.md,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelBtnText: {
    color: Colors.textSecondary,
    fontWeight: '600',
    fontSize: 14,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${Colors.error}14`,
    borderRadius: Radius.lg,
    paddingVertical: 16,
    borderWidth: 1,
    borderColor: `${Colors.error}33`,
  },
  logoutIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.error,
  },
  version: {
    textAlign: 'center',
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: Spacing.xl,
  },
});
