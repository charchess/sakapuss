import React, { useEffect, useState } from 'react';
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
import { dataService } from '../store/dataService';
import { Resource, Bowl } from '../api/client';
import { HomeStackParamList } from '../navigation/AppNavigator';

type Props = StackScreenProps<HomeStackParamList, 'QuickLog'>;

const LITTER_NOTES = ['RAS', 'Sang', 'Diarrhée', 'Constipation', 'Vomi'];
const BEHAVIOR_QUICK = ['Vomissement', 'Perte appétit', 'Léthargie', 'Grattage', 'Agitation'];

export function QuickLogScreen({ navigation, route }: Props) {
  const { type, label, icon, petId, petName } = route.params;

  const [loading, setLoading] = useState(false);
  const [loadingResources, setLoadingResources] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Resource selection (litter)
  const [litières, setLitières] = useState<Resource[]>([]);
  const [selectedLitière, setSelectedLitière] = useState<string | null>(null);
  const [litterNote, setLitterNote] = useState<string>('RAS');

  // Bowl selection (food_serve)
  const [bowls, setBowls] = useState<Bowl[]>([]);
  const [selectedBowl, setSelectedBowl] = useState<string | null>(null);
  const [amount, setAmount] = useState('');

  // Weight fields
  const [grams, setGrams] = useState('');
  const [weightNote, setWeightNote] = useState('');

  // Health note fields
  const [product, setProduct] = useState('');
  const [dose, setDose] = useState('');

  // Behavior / custom fields
  const [note, setNote] = useState('');
  const [quickBehavior, setQuickBehavior] = useState('');

  useEffect(() => {
    if (type === 'litter_clean') {
      setLoadingResources(true);
      dataService.getResources('litter')
        .then((data) => {
          setLitières(data.filter((r) => r.enabled));
          if (data.length > 0) setSelectedLitière(data[0].id);
        })
        .catch(() => {})
        .finally(() => setLoadingResources(false));
    } else if (type === 'food_serve') {
      setLoadingResources(true);
      dataService.getBowls()
        .then((data) => {
          const food = data.filter((b) => b.bowl_type === 'food');
          setBowls(food);
          if (food.length > 0) setSelectedBowl(food[0].id);
        })
        .catch(() => {})
        .finally(() => setLoadingResources(false));
    }
  }, [type]);

  const buildPayload = (): Record<string, unknown> => {
    switch (type) {
      case 'weight':
        return { grams: parseFloat(grams) || 0, note: weightNote.trim() || undefined };
      case 'health_note':
        return { product: product.trim(), dose: dose.trim() || undefined };
      case 'behavior':
        return { note: (quickBehavior || note).trim() };
      case 'custom':
        return { note: note.trim() };
      case 'food_serve':
        return { bowl_id: selectedBowl, amount_grams: parseFloat(amount) || undefined };
      case 'litter_clean':
        return { resource_id: selectedLitière, note: litterNote !== 'RAS' ? litterNote : undefined };
      default:
        return {};
    }
  };

  const validate = (): string | null => {
    switch (type) {
      case 'weight':
        if (!petId) return 'Aucun animal sélectionné.';
        if (!grams.trim() || isNaN(parseFloat(grams))) return 'Veuillez saisir un poids valide.';
        break;
      case 'health_note':
        if (!petId) return 'Aucun animal sélectionné.';
        if (!product.trim()) return 'Veuillez saisir le nom du médicament.';
        break;
      case 'behavior':
        if (!petId) return 'Aucun animal sélectionné.';
        if (!quickBehavior && !note.trim()) return 'Veuillez saisir ou choisir une observation.';
        break;
      case 'custom':
        if (!petId) return 'Aucun animal sélectionné.';
        if (!note.trim()) return 'Veuillez saisir une description.';
        break;
      case 'litter_clean':
        if (!selectedLitière && litières.length > 0) return 'Sélectionnez une litière.';
        break;
      case 'food_serve':
        if (!selectedBowl && bowls.length > 0) return 'Sélectionnez une gamelle.';
        break;
    }
    return null;
  };

  const handleSubmit = async () => {
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setError(null);
    setLoading(true);
    try {
      if (type === 'food_serve' && selectedBowl) {
        await dataService.fillBowl(selectedBowl, {
          pet_id: petId ?? undefined,
          amount_g: parseFloat(amount) || undefined,
        });
      }
      if (petId) {
        await dataService.logEvent(petId, type, buildPayload());
      } else if (type === 'litter_clean' || type === 'food_serve') {
        // resource-level events don't require a pet
        if (petId) await dataService.logEvent(petId, type, buildPayload());
      }
      navigation.goBack();
    } catch (err: unknown) {
      const msg = (err as { message?: string })?.message ?? 'Erreur lors de la sauvegarde.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const renderLitterFields = () => (
    <>
      {loadingResources ? (
        <ActivityIndicator color={Colors.primary} style={{ marginVertical: 24 }} />
      ) : litières.length === 0 ? (
        <View style={styles.emptyResourceBox}>
          <Text style={styles.emptyResourceIcon}>🚽</Text>
          <Text style={styles.emptyResourceText}>Aucune litière configurée</Text>
          <TouchableOpacity
            style={styles.configureBtn}
            onPress={() => (navigation as any).navigate('Foyer')}
            testID="configure-litter-btn"
          >
            <Text style={styles.configureBtnText}>Configurer les litières →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Quelle litière ?</Text>
          {litières.map((r) => (
            <TouchableOpacity
              key={r.id}
              style={[styles.resourceCard, selectedLitière === r.id && styles.resourceCardActive]}
              onPress={() => setSelectedLitière(r.id)}
              activeOpacity={0.7}
              testID={`litter-card-${r.id}`}
            >
              <View style={[styles.resourceDot, { backgroundColor: r.color ?? Colors.accent }]} />
              <Text style={[styles.resourceName, selectedLitière === r.id && styles.resourceNameActive]}>
                {r.name}
              </Text>
              {selectedLitière === r.id && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>
      )}

      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Observation</Text>
        <View style={styles.pillRow}>
          {LITTER_NOTES.map((n) => (
            <TouchableOpacity
              key={n}
              style={[styles.pill, litterNote === n && styles.pillActive]}
              onPress={() => setLitterNote(n)}
              activeOpacity={0.7}
              testID={`litter-note-${n.toLowerCase()}`}
            >
              <Text style={[styles.pillText, litterNote === n && styles.pillTextActive]}>{n}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </>
  );

  const renderFoodFields = () => (
    <>
      {loadingResources ? (
        <ActivityIndicator color={Colors.primary} style={{ marginVertical: 24 }} />
      ) : bowls.length === 0 ? (
        <View style={styles.emptyResourceBox}>
          <Text style={styles.emptyResourceIcon}>🥣</Text>
          <Text style={styles.emptyResourceText}>Aucune gamelle configurée</Text>
          <TouchableOpacity
            style={styles.configureBtn}
            onPress={() => (navigation as any).navigate('Foyer')}
            testID="configure-bowl-btn"
          >
            <Text style={styles.configureBtnText}>Configurer les gamelles →</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Quelle gamelle ?</Text>
          {bowls.map((b) => (
            <TouchableOpacity
              key={b.id}
              style={[styles.resourceCard, selectedBowl === b.id && styles.resourceCardActive]}
              onPress={() => setSelectedBowl(b.id)}
              activeOpacity={0.7}
            >
              <Text style={styles.resourceCardIcon}>🥣</Text>
              <View style={styles.resourceCardInfo}>
                <Text style={[styles.resourceName, selectedBowl === b.id && styles.resourceNameActive]}>
                  {b.name}
                </Text>
                <Text style={styles.resourceSub}>{b.location}</Text>
              </View>
              {selectedBowl === b.id && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>
      )}

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
    </>
  );

  const renderWeightFields = () => (
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
          autoFocus
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

  const renderHealthFields = () => (
    <>
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Médicament / Produit</Text>
        <TextInput
          style={styles.input}
          placeholder="ex: Frontline, Milbemax, Advocate..."
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

  const renderBehaviorFields = () => (
    <>
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Type d'observation</Text>
        <View style={styles.pillRow}>
          {BEHAVIOR_QUICK.map((b) => (
            <TouchableOpacity
              key={b}
              style={[styles.pill, quickBehavior === b && styles.pillActiveRed]}
              onPress={() => setQuickBehavior(quickBehavior === b ? '' : b)}
              activeOpacity={0.7}
            >
              <Text style={[styles.pillText, quickBehavior === b && styles.pillTextActive]}>{b}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Détails (optionnel)</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Décrivez ce que vous avez observé..."
          placeholderTextColor={Colors.textMuted}
          multiline
          numberOfLines={4}
          value={note}
          onChangeText={setNote}
        />
      </View>
    </>
  );

  const renderCustomFields = () => (
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
        autoFocus
      />
    </View>
  );

  const renderFields = () => {
    switch (type) {
      case 'litter_clean': return renderLitterFields();
      case 'food_serve': return renderFoodFields();
      case 'weight': return renderWeightFields();
      case 'health_note': return renderHealthFields();
      case 'behavior': return renderBehaviorFields();
      case 'custom': return renderCustomFields();
      default: return null;
    }
  };

  const submitLabel = type === 'litter_clean' || type === 'food_serve' ? 'Confirmer' : 'Enregistrer';

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
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
          testID="quicklog-submit-btn"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>{submitLabel}</Text>
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
  root: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.xl, paddingBottom: 48 },
  pageHeader: { alignItems: 'center', marginBottom: Spacing.xl },
  pageIcon: { fontSize: 56, marginBottom: 8 },
  pageTitle: { ...Typography.h2, color: Colors.textPrimary, marginBottom: 8 },
  petPill: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  petPillText: { fontSize: 13, fontWeight: '600', color: Colors.primary },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.xl,
    marginBottom: Spacing.xl,
    ...Shadow.card,
  },
  field: { marginBottom: Spacing.lg },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, marginBottom: 6 },
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
  multiline: { height: 100, textAlignVertical: 'top' },
  // Resource cards
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  resourceCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  resourceDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.sm,
  },
  resourceCardIcon: { fontSize: 20, marginRight: Spacing.sm },
  resourceCardInfo: { flex: 1 },
  resourceName: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  resourceNameActive: { color: Colors.primary },
  resourceSub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  checkmark: { fontSize: 18, color: Colors.primary, fontWeight: '700' },
  // Empty resource state
  emptyResourceBox: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyResourceIcon: { fontSize: 40, marginBottom: Spacing.sm },
  emptyResourceText: { fontSize: 14, color: Colors.textMuted, marginBottom: Spacing.md },
  configureBtn: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: 8,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  configureBtnText: { fontSize: 13, color: Colors.primary, fontWeight: '600' },
  // Pills
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  pillActive: { borderColor: Colors.accent, backgroundColor: `${Colors.accent}22` },
  pillActiveRed: { borderColor: Colors.error, backgroundColor: `${Colors.error}18` },
  pillText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  pillTextActive: { color: Colors.textPrimary },
  // Buttons
  button: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    ...Shadow.card,
  },
  buttonDisabled: { opacity: 0.6 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  cancel: { marginTop: Spacing.md, alignItems: 'center', paddingVertical: 12 },
  cancelText: { fontSize: 14, color: Colors.textSecondary, fontWeight: '600' },
  errorBox: {
    backgroundColor: 'rgba(225,112,85,0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: Spacing.md,
  },
  errorText: { color: '#E17055', fontSize: 14 },
});
