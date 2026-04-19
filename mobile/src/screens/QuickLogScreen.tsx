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
import { logEvent } from '../api/sync';
import { HomeStackParamList } from '../navigation/AppNavigator';

type Props = StackScreenProps<HomeStackParamList, 'QuickLog'>;

export function QuickLogScreen({ navigation, route }: Props) {
  const { type, label, icon, petId, petName } = route.params;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Weight fields
  const [grams, setGrams] = useState('');
  const [weightNote, setWeightNote] = useState('');

  // Health note fields
  const [product, setProduct] = useState('');
  const [dose, setDose] = useState('');

  // Behavior fields
  const [note, setNote] = useState('');

  // Food serve fields
  const [amount, setAmount] = useState('');

  const buildPayload = (): Record<string, unknown> => {
    switch (type) {
      case 'weight':
        return { grams: parseFloat(grams) || 0, note: weightNote.trim() || undefined };
      case 'health_note':
        return { product: product.trim(), dose: dose.trim() || undefined };
      case 'behavior':
        return { note: note.trim() };
      case 'custom':
        return { note: note.trim() };
      case 'food_serve':
        return { amount_grams: parseFloat(amount) || undefined };
      case 'litter_clean':
        return {};
      default:
        return {};
    }
  };

  const validate = (): string | null => {
    if (!petId) return 'Aucun animal sélectionné. Retournez au tableau de bord et choisissez un animal.';
    switch (type) {
      case 'weight':
        if (!grams.trim() || isNaN(parseFloat(grams))) return 'Veuillez saisir un poids valide.';
        break;
      case 'health_note':
        if (!product.trim()) return 'Veuillez saisir le nom du médicament.';
        break;
      case 'behavior':
      case 'custom':
        if (!note.trim()) return 'Veuillez saisir une note.';
        break;
    }
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    setLoading(true);
    try {
      await logEvent(petId!, type, buildPayload());
      navigation.goBack();
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Erreur lors de la sauvegarde.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const renderFields = () => {
    switch (type) {
      case 'weight':
        return (
          <>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Poids (grammes)</Text>
              <TextInput
                style={styles.input}
                placeholder="ex: 4250"
                placeholderTextColor={Colors.textMuted}
                keyboardType="numeric"
                value={grams}
                onChangeText={setGrams}
                testID="weight-input"
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Note (optionnel)</Text>
              <TextInput
                style={[styles.input, styles.multiline]}
                placeholder="ex: Après le repas du soir"
                placeholderTextColor={Colors.textMuted}
                multiline
                numberOfLines={3}
                value={weightNote}
                onChangeText={setWeightNote}
              />
            </View>
          </>
        );

      case 'health_note':
        return (
          <>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Médicament / Produit</Text>
              <TextInput
                style={styles.input}
                placeholder="ex: Frontline, Milbemax..."
                placeholderTextColor={Colors.textMuted}
                value={product}
                onChangeText={setProduct}
              />
            </View>
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Dose (optionnel)</Text>
              <TextInput
                style={styles.input}
                placeholder="ex: 1 comprimé, 0.5 ml..."
                placeholderTextColor={Colors.textMuted}
                value={dose}
                onChangeText={setDose}
              />
            </View>
          </>
        );

      case 'behavior':
        return (
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Observation</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              placeholder="Décrivez le comportement observé..."
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={5}
              value={note}
              onChangeText={setNote}
            />
          </View>
        );

      case 'custom':
        return (
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Description de l'événement</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              placeholder="Décrivez l'événement..."
              placeholderTextColor={Colors.textMuted}
              multiline
              numberOfLines={5}
              value={note}
              onChangeText={setNote}
            />
          </View>
        );

      case 'food_serve':
        return (
          <View style={styles.field}>
            <Text style={styles.fieldLabel}>Quantité (grammes, optionnel)</Text>
            <TextInput
              style={styles.input}
              placeholder="ex: 80"
              placeholderTextColor={Colors.textMuted}
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />
          </View>
        );

      case 'litter_clean':
        return (
          <View style={styles.confirmBox}>
            <Text style={styles.confirmText}>
              Confirmer que la litière a été nettoyée ?
            </Text>
          </View>
        );

      default:
        return null;
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
        {/* Header */}
        <View style={styles.pageHeader}>
          <Text style={styles.pageIcon}>{icon}</Text>
          <Text style={styles.pageTitle}>{label}</Text>
          {petName ? (
            <View style={styles.petPill}>
              <Text style={styles.petPillText}>📌 {petName}</Text>
            </View>
          ) : null}
        </View>

        {/* Fields */}
        <View style={styles.card}>
          {renderFields()}
        </View>

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => { setError(null); handleSubmit(); }} style={styles.retryBtn}>
              <Text style={styles.retryText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Submit */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>
              {type === 'litter_clean' ? 'Confirmer' : 'Enregistrer'}
            </Text>
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
  pageHeader: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  pageIcon: {
    fontSize: 56,
    marginBottom: 8,
  },
  pageTitle: {
    ...Typography.h2,
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  petPill: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  petPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
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
  multiline: {
    height: 100,
    textAlignVertical: 'top',
  },
  confirmBox: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  confirmText: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
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
