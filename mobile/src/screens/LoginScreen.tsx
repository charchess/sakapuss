import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Colors, Radius, Spacing, Typography, Shadow } from '../constants/theme';
import { api } from '../api/client';
import { AuthStore } from '../store/auth';
import { localDb } from '../store/localDb';

async function migrateLocalToServer(): Promise<void> {
  const [pets, resources, bowls, products, bags] = await Promise.all([
    localDb.getPets(),
    localDb.getResources(),
    localDb.getBowls(),
    localDb.getFoodProducts(),
    localDb.getFoodBags(),
  ]);

  // Migrate pets; build old→new ID map for event migration
  const petIdMap = new Map<string, string>();
  for (const pet of pets) {
    try {
      const newPet = await api.createPet({
        name: pet.name,
        species: pet.species,
        birth_date: pet.birth_date ?? new Date().toISOString().split('T')[0],
        breed: pet.breed,
      });
      petIdMap.set(pet.id, newPet.id);
    } catch { /* skip individual failures */ }
  }

  // Migrate events in chronological order
  for (const [oldId, newId] of petIdMap.entries()) {
    const events = await localDb.getPetEvents(oldId);
    for (const event of [...events].reverse()) {
      try {
        await api.createPetEvent(newId, event.type, event.payload, event.occurred_at);
      } catch { /* skip */ }
    }
  }

  // Migrate resources
  for (const r of resources) {
    try { await api.createResource({ name: r.name, type: r.type, color: r.color }); }
    catch { /* skip */ }
  }

  // Migrate bowls
  for (const b of bowls) {
    try { await api.createBowl({ name: b.name, location: b.location, bowl_type: b.bowl_type, capacity_g: b.capacity_g }); }
    catch { /* skip */ }
  }

  // Migrate food products; build product ID map for bag migration
  const productIdMap = new Map<string, string>();
  for (const p of products) {
    try {
      const newP = await api.createFoodProduct({
        name: p.name, brand: p.brand,
        food_type: p.food_type, food_category: p.food_category,
        default_bag_weight_g: p.default_bag_weight_g,
      });
      productIdMap.set(p.id, newP.id);
    } catch { /* skip */ }
  }

  // Migrate food bags with remapped product IDs
  for (const bag of bags) {
    const newProductId = productIdMap.get(bag.product_id) ?? bag.product_id;
    try {
      const newBag = await api.createFoodBag({
        product_id: newProductId,
        weight_g: bag.weight_g,
        purchased_at: bag.purchased_at,
      });
      if (bag.status === 'opened') await api.openFoodBag(newBag.id).catch(() => {});
      if (bag.status === 'depleted') {
        await api.openFoodBag(newBag.id).catch(() => {});
        await api.depleteFoodBag(newBag.id).catch(() => {});
      }
    } catch { /* skip */ }
  }

  await localDb.clear();
}

interface Props {
  onLoginSuccess: () => void;
}

export function LoginScreen({ onLoginSuccess }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [displayName, setDisplayName] = useState('');

  const handleGuestMode = async () => {
    await AuthStore.setGuestMode();
    onLoginSuccess();
  };

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Champs requis', 'Veuillez saisir votre email et mot de passe.');
      return;
    }
    if (mode === 'register' && !displayName.trim()) {
      Alert.alert('Champ requis', 'Veuillez saisir votre prénom ou pseudo.');
      return;
    }

    setLoading(true);
    try {
      const wasGuest = await AuthStore.isGuestMode();

      const response =
        mode === 'login'
          ? await api.login(email.trim(), password)
          : await api.register(email.trim(), password, displayName.trim());

      await AuthStore.setToken(response.access_token);
      await AuthStore.setUser(response.user);

      if (wasGuest) {
        await migrateLocalToServer();
      }

      onLoginSuccess();
    } catch (err: unknown) {
      const msg =
        (err as { message?: string })?.message ?? 'Une erreur est survenue.';
      Alert.alert('Erreur', msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <StatusBar style="dark" backgroundColor={Colors.background} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo area */}
        <View style={styles.hero}>
          <Text style={styles.logo}>🐾</Text>
          <Text style={styles.appName}>Sakapuss</Text>
          <Text style={styles.tagline}>Suivi bien-être de vos animaux</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {mode === 'login' ? 'Connexion' : 'Créer un compte'}
          </Text>

          {mode === 'register' && (
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Prénom / Pseudo</Text>
              <TextInput
                style={styles.input}
                placeholder="Votre prénom"
                placeholderTextColor={Colors.textMuted}
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
                returnKeyType="next"
              />
            </View>
          )}

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="votre@email.com"
              placeholderTextColor={Colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
              testID="email-input"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Mot de passe</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor={Colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              testID="password-input"
            />
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
            activeOpacity={0.8}
            testID="login-btn"
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>
                {mode === 'login' ? 'Se connecter' : 'Créer le compte'}
              </Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.switchMode}
            onPress={() => setMode(mode === 'login' ? 'register' : 'login')}
          >
            <Text style={styles.switchModeText}>
              {mode === 'login'
                ? "Pas encore de compte ? S'inscrire"
                : 'Déjà un compte ? Se connecter'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Separator */}
        <View style={styles.separator}>
          <View style={styles.separatorLine} />
          <Text style={styles.separatorText}>ou</Text>
          <View style={styles.separatorLine} />
        </View>

        <TouchableOpacity style={styles.guestButton} onPress={handleGuestMode} testID="guest-btn">
          <Text style={styles.guestText}>Continuer sans compte</Text>
        </TouchableOpacity>
      </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    flexGrow: 1,
    padding: Spacing.xl,
    justifyContent: 'center',
  },
  hero: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  logo: {
    fontSize: 72,
    marginBottom: 8,
  },
  appName: {
    ...Typography.h1,
    color: Colors.primary,
    letterSpacing: 1,
  },
  tagline: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    ...Shadow.modal,
  },
  cardTitle: {
    ...Typography.h3,
    marginBottom: Spacing.xl,
    textAlign: 'center',
  },
  field: {
    marginBottom: Spacing.lg,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: Spacing.sm,
    ...Shadow.card,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  switchMode: {
    marginTop: Spacing.lg,
    alignItems: 'center',
  },
  switchModeText: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  separator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  separatorText: {
    marginHorizontal: Spacing.md,
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  guestButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  guestText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
