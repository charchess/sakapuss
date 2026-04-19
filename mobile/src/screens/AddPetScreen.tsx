import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Colors, Radius, Spacing, Shadow, Typography } from '../constants/theme';
import { api } from '../api/client';
import { AuthStore } from '../store/auth';
import { HomeStackParamList } from '../navigation/AppNavigator';

type Props = StackScreenProps<HomeStackParamList, 'AddPet'>;

const SPECIES_OPTIONS = ['Chat', 'Chien', 'Lapin', 'Oiseau', 'Hamster', 'Autre'];

export function AddPetScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [breed, setBreed] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validate = (): string | null => {
    if (!name.trim()) return 'Le nom est requis.';
    if (!species.trim()) return "L'espèce est requise.";
    if (!birthDate.trim()) return 'La date de naissance est requise.';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDate.trim())) return 'Format de date invalide (YYYY-MM-DD).';
    return null;
  };

  const handleSubmit = async () => {
    const guest = await AuthStore.isGuestMode();
    if (guest) {
      setError('Créez un compte pour ajouter des animaux.');
      return;
    }
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await api.createPet({
        name: name.trim(),
        species: species.trim(),
        birth_date: birthDate.trim(),
        breed: breed.trim() || undefined,
      });
      navigation.goBack();
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Impossible de créer l\'animal.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" backgroundColor={Colors.background} />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.icon}>🐾</Text>
          <Text style={styles.title}>Nouvel animal</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Nom *</Text>
            <TextInput
              style={styles.input}
              placeholder="Nom de l'animal"
              placeholderTextColor={Colors.textMuted}
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              testID="pet-name-input"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Espèce *</Text>
            <View style={styles.speciesRow}>
              {SPECIES_OPTIONS.map((s) => (
                <TouchableOpacity
                  key={s}
                  style={[styles.speciesPill, species === s && styles.speciesPillActive]}
                  onPress={() => setSpecies(s)}
                  activeOpacity={0.7}
                  testID={`species-pill-${s.toLowerCase()}`}
                >
                  <Text style={[styles.speciesPillText, species === s && styles.speciesPillTextActive]}>
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Date de naissance * (YYYY-MM-DD)</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={Colors.textMuted}
              value={birthDate}
              onChangeText={setBirthDate}
              keyboardType="numbers-and-punctuation"
              testID="pet-birthdate-input"
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Race (optionnel)</Text>
            <TextInput
              style={styles.input}
              placeholder="ex: Européen, Labrador..."
              placeholderTextColor={Colors.textMuted}
              value={breed}
              onChangeText={setBreed}
            />
          </View>
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => { setError(null); handleSubmit(); }} style={styles.retryBtn}>
              <Text style={styles.retryText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Ajouter</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.cancel} onPress={() => navigation.goBack()}>
          <Text style={styles.cancelText}>Annuler</Text>
        </TouchableOpacity>
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
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  icon: {
    fontSize: 56,
    marginBottom: 8,
  },
  title: {
    ...Typography.h2,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    ...Shadow.card,
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
  speciesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  speciesPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  speciesPillActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  speciesPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  speciesPillTextActive: {
    color: Colors.primary,
  },
  button: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 16,
    alignItems: 'center',
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
  cancel: {
    marginTop: Spacing.md,
    alignItems: 'center',
    paddingVertical: 12,
  },
  cancelText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  errorBox: {
    backgroundColor: 'rgba(225,112,85,0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: Spacing.md,
  },
  errorText: {
    color: '#E17055',
    fontSize: 14,
  },
  retryBtn: {
    marginTop: 8,
    backgroundColor: '#E17055',
    borderRadius: 8,
    padding: 10,
    alignItems: 'center' as const,
  },
  retryText: {
    color: 'white',
    fontWeight: '700' as const,
  },
});
