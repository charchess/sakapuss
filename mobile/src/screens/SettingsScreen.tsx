import React, { useEffect, useState } from 'react';
import Constants from 'expo-constants';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Colors, Radius, Spacing, Shadow, Typography } from '../constants/theme';
import { AuthStore, User } from '../store/auth';
import { SyncQueue } from '../store/syncQueue';
import { OnboardingState, ModuleConfig } from '../store/onboardingState';
import { DEFAULT_BASE_URL } from '../constants/api';

interface Props {
  onLogout: () => void;
}

const SETUP_ROWS = [
  { key: 'health' as const, icon: '💊', label: 'Rappels santé' },
  { key: 'weight' as const, icon: '⚖️', label: 'Poids initial' },
  { key: 'food' as const, icon: '🥣', label: 'Configuration alimentation' },
];

export function SettingsScreen({ onLogout }: Props) {
  const navigation = useNavigation<any>(); // eslint-disable-line @typescript-eslint/no-explicit-any
  const [user, setUser] = useState<User | null>(null);
  const [baseUrl, setBaseUrl] = useState(DEFAULT_BASE_URL);
  const [editingUrl, setEditingUrl] = useState(false);
  const [urlDraft, setUrlDraft] = useState('');
  const [pendingCount, setPendingCount] = useState(0);
  const [isGuest, setIsGuest] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState<Record<string, boolean>>({});
  const [modules, setModules] = useState<ModuleConfig>({ health: true, litter: true, bowls: true, food: false });

  useEffect(() => {
    const load = async () => {
      const [u, url, count, guest, obs, mods] = await Promise.all([
        AuthStore.getUser(),
        AuthStore.getBaseUrl(),
        SyncQueue.getPendingCount(),
        AuthStore.isGuestMode(),
        OnboardingState.get(),
        OnboardingState.getModules(),
      ]);
      setUser(u);
      setBaseUrl(url);
      setUrlDraft(url);
      setPendingCount(count);
      setIsGuest(guest);
      setOnboardingDone(obs);
      setModules(mods);
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
    const title = isGuest ? 'Quitter le mode invité' : 'Déconnexion';
    const message = isGuest
      ? 'Retourner à l\'écran de connexion ?'
      : 'Êtes-vous sûr de vouloir vous déconnecter ?';
    const confirmLabel = isGuest ? 'Quitter' : 'Déconnecter';
    Alert.alert(title, message, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: confirmLabel,
        style: 'destructive',
        onPress: async () => {
          await AuthStore.logout();
          onLogout();
        },
      },
    ]);
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

        {/* Setup banner — shown when onboarding has incomplete categories */}
        {SETUP_ROWS.some((r) => !onboardingDone[r.key]) && (
          <View style={styles.setupBanner} testID="parametres-setup-banner">
            <Text style={styles.setupBannerTitle}>Terminer la configuration</Text>
            {SETUP_ROWS.filter((r) => !onboardingDone[r.key]).map((r) => (
              <TouchableOpacity
                key={r.key}
                style={styles.setupRow}
                onPress={() =>
                  navigation.navigate('Accueil', {
                    screen: 'OnboardingAdmin',
                    params: { fromSettings: true },
                  })
                }
                activeOpacity={0.7}
                testID="parametres-setup-row"
              >
                <Text style={styles.setupRowIcon}>{r.icon}</Text>
                <Text style={styles.setupRowLabel}>{r.label}</Text>
                <Text style={styles.setupRowArrow}>›</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* User info / Guest banner */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Compte</Text>
          {isGuest ? (
            <View style={styles.guestBanner}>
              <Text style={styles.guestBannerIcon}>🐾</Text>
              <View style={styles.guestBannerBody}>
                <Text style={styles.guestBannerTitle}>Mode invité</Text>
                <Text style={styles.guestBannerText}>
                  Créez un compte pour synchroniser vos données.
                </Text>
              </View>
              <TouchableOpacity onPress={handleLogout} style={styles.guestBannerBtn}>
                <Text style={styles.guestBannerBtnText}>Créer →</Text>
              </TouchableOpacity>
            </View>
          ) : (
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
          )}
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

        {/* Fonctionnalités */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fonctionnalités</Text>
          <View style={styles.card}>
            {([
              { key: 'health' as const, icon: '💊', label: 'Rappels santé' },
              { key: 'litter' as const, icon: '🚽', label: 'Litière' },
              { key: 'bowls' as const, icon: '🥣', label: 'Gamelles' },
              { key: 'food' as const, icon: '🛒', label: 'Stock alimentaire' },
            ] as const).map((m, i, arr) => (
              <View key={m.key}>
                <View style={styles.row}>
                  <Text style={styles.rowIcon}>{m.icon}</Text>
                  <View style={styles.rowBody}>
                    <Text style={styles.rowValue}>{m.label}</Text>
                  </View>
                  <Switch
                    value={modules[m.key]}
                    onValueChange={(v) => {
                      const next = { ...modules, [m.key]: v };
                      setModules(next);
                      OnboardingState.setModules(next);
                    }}
                    trackColor={{ false: Colors.border, true: Colors.primary }}
                    thumbColor="#fff"
                  />
                </View>
                {i < arr.length - 1 && <View style={styles.divider} />}
              </View>
            ))}
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
            <Text style={styles.logoutText}>{isGuest ? 'Quitter le mode invité' : 'Se déconnecter'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.version}>
          Sakapuss v{Constants.expoConfig?.version ?? '1.0.0'} ({Constants.expoConfig?.android?.versionCode ?? 1})
        </Text>
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
  guestBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
    gap: 10,
  },
  guestBannerIcon: {
    fontSize: 24,
  },
  guestBannerBody: {
    flex: 1,
  },
  guestBannerTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  guestBannerText: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  guestBannerBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  guestBannerBtnText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
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
  setupBanner: {
    backgroundColor: `${Colors.accent}18`,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: `${Colors.accent}44`,
    padding: Spacing.md,
    marginBottom: Spacing.xl,
  },
  setupBannerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
  },
  setupRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: `${Colors.accent}33`,
  },
  setupRowIcon: {
    fontSize: 18,
    marginRight: Spacing.sm,
    width: 26,
    textAlign: 'center',
  },
  setupRowLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  setupRowArrow: {
    fontSize: 18,
    color: Colors.textMuted,
  },
});
