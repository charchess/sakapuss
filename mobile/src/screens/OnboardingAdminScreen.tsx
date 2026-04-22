import React, { useState, useEffect } from 'react';
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
import DateTimePicker from '@react-native-community/datetimepicker';
import { StackScreenProps } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Colors, Radius, Spacing, Shadow, Typography } from '../constants/theme';
import { dataService } from '../store/dataService';
import { OnboardingState } from '../store/onboardingState';
import { HomeStackParamList } from '../navigation/AppNavigator';
import { Pet } from '../api/client';

type Props = StackScreenProps<HomeStackParamList, 'OnboardingAdmin'>;

const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// ─── Types ────────────────────────────────────────────────────────────────────

interface PetDraft {
  key: string;
  name: string;
  species: string;
  birth_date: string;
  dateObj: Date;
  showPicker: boolean;
  breed: string;
}

interface ReminderDraft {
  key: string;
  name: string;
  frequency_days: number;
  customDays: string;
  useCustom: boolean;
  enabled: boolean;
}

interface BowlDraft {
  key: string;
  name: string;
  location: string;
  bowl_type: 'food' | 'water';
}

interface FoodDraft {
  key: string;
  name: string;
  brand: string;
  food_type: 'dry' | 'wet' | 'mixed';
  bag_weight_g: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SPECIES_OPTIONS = ['Chat', 'Chien', 'Lapin', 'Oiseau', 'Hamster', 'Autre'];

const FREQ_PRESETS = [
  { label: '15j', days: 15 },
  { label: '1 mois', days: 30 },
  { label: '3 mois', days: 90 },
  { label: '6 mois', days: 180 },
  { label: '1 an', days: 365 },
];

const SUGGESTED_REMINDERS: Omit<ReminderDraft, 'key'>[] = [
  { name: 'Vermifuge', frequency_days: 90, customDays: '', useCustom: false, enabled: true },
  { name: 'Anti-puces / antiparasitaire', frequency_days: 90, customDays: '', useCustom: false, enabled: true },
  { name: 'Vaccin annuel', frequency_days: 365, customDays: '', useCustom: false, enabled: false },
];

const STEPS = ['pets', 'health', 'weight', 'bowls', 'food'] as const;
type Step = typeof STEPS[number];

const STEP_META: Record<Step, { icon: string; title: string; subtitle: string }> = {
  pets: { icon: '🐾', title: 'Vos animaux', subtitle: 'Ajoutez les animaux de votre foyer' },
  health: { icon: '💊', title: 'Rappels santé', subtitle: 'Personnalisez les rappels et traitements' },
  weight: { icon: '⚖️', title: 'Poids initial', subtitle: "Notez un poids de départ pour chaque animal" },
  bowls: { icon: '🥣', title: 'Gamelles', subtitle: 'Configurez les gamelles du foyer' },
  food: { icon: '🛒', title: 'Stocks & produits', subtitle: 'Enregistrez vos produits alimentaires en cours' },
};

function newPetDraft(): PetDraft {
  return { key: uid(), name: '', species: '', birth_date: '', dateObj: new Date(2020, 0, 1), showPicker: false, breed: '' };
}

function newBowlDraft(): BowlDraft {
  return { key: uid(), name: '', location: '', bowl_type: 'food' };
}

function newFoodDraft(): FoodDraft {
  return { key: uid(), name: '', brand: '', food_type: 'dry', bag_weight_g: '' };
}

// ─── Component ────────────────────────────────────────────────────────────────

export function OnboardingAdminScreen({ navigation, route }: Props) {
  const fromSettings = route.params?.fromSettings ?? false;

  const [stepIndex, setStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Step: pets
  const [existingPets, setExistingPets] = useState<Pet[]>([]);
  const [petDrafts, setPetDrafts] = useState<PetDraft[]>([]);
  const [allPets, setAllPets] = useState<Pet[]>([]);

  // Step: health
  const [reminders, setReminders] = useState<ReminderDraft[]>(
    SUGGESTED_REMINDERS.map((r) => ({ ...r, key: uid() }))
  );

  // Step: weight
  const [weights, setWeights] = useState<Record<string, string>>({});

  // Step: bowls
  const [bowls, setBowls] = useState<BowlDraft[]>([newBowlDraft()]);

  // Step: food
  const [foods, setFoods] = useState<FoodDraft[]>([]);

  useEffect(() => {
    dataService
      .getPets()
      .then((pets) => {
        setExistingPets(pets);
        setAllPets(pets);
        if (pets.length === 0) {
          setPetDrafts([newPetDraft()]);
        }
      })
      .catch(() => {})
      .finally(() => setInitializing(false));
  }, []);

  const currentStep = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;

  // ─── Save handlers ──────────────────────────────────────────────────────────

  const handleSave = async () => {
    setError(null);
    setLoading(true);
    try {
      if (currentStep === 'pets') {
        const validDrafts = petDrafts.filter((d) => d.name.trim() && d.species.trim() && d.birth_date.trim());
        if (existingPets.length === 0 && validDrafts.length === 0) {
          setError('Ajoutez au moins un animal pour continuer.');
          setLoading(false);
          return;
        }
        const created = await Promise.all(
          validDrafts.map((d) =>
            dataService.createPet({
              name: d.name.trim(),
              species: d.species.trim(),
              birth_date: d.birth_date,
              breed: d.breed.trim() || undefined,
            })
          )
        );
        const merged = [...existingPets, ...created];
        setAllPets(merged);
        await OnboardingState.markDone('pets');
      } else if (currentStep === 'health') {
        const active = reminders.filter((r) => r.enabled);
        const freq = (r: ReminderDraft) => r.useCustom ? parseInt(r.customDays, 10) || 30 : r.frequency_days;
        const calls = active.flatMap((r) =>
          allPets.map((pet) =>
            dataService.createReminder(pet.id, { name: r.name, frequency_days: freq(r), type: 'health' })
          )
        );
        await Promise.all(calls);
        await OnboardingState.markDone('health');
      } else if (currentStep === 'weight') {
        await Promise.all(
          allPets
            .filter((pet) => {
              const g = parseFloat(weights[pet.id] ?? '');
              return !isNaN(g) && g > 0;
            })
            .map((pet) =>
              dataService.logEvent(pet.id, 'weight', { grams: parseFloat(weights[pet.id]) })
            )
        );
        await OnboardingState.markDone('weight');
      } else if (currentStep === 'bowls') {
        const valid = bowls.filter((b) => b.name.trim());
        await Promise.all(
          valid.map((b) =>
            dataService.createBowl({
              name: b.name.trim(),
              location: b.location.trim() || 'Cuisine',
              bowl_type: b.bowl_type,
            })
          )
        );
        await OnboardingState.markDone('bowls');
      } else if (currentStep === 'food') {
        const valid = foods.filter((f) => f.name.trim());
        await Promise.all(
          valid.map(async (f) => {
            const product = await dataService.createFoodProduct({
              name: f.name.trim(),
              brand: f.brand.trim() || 'Autre',
              food_type: f.food_type,
              food_category: 'cat',
            });
            const bagG = parseInt(f.bag_weight_g, 10);
            if (!isNaN(bagG) && bagG > 0) {
              await dataService.createFoodBag({
                product_id: product.id,
                weight_g: bagG,
                purchased_at: new Date().toISOString().slice(0, 10),
              });
            }
          })
        );
        await OnboardingState.markDone('food');
      }
      advance();
    } catch (err: unknown) {
      setError((err as { message?: string })?.message ?? 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const advance = () => {
    if (isLastStep) {
      finish();
    } else {
      setStepIndex((i) => i + 1);
      setError(null);
    }
  };

  const finish = () => {
    if (fromSettings) navigation.goBack();
    else navigation.navigate('Dashboard');
  };

  // ─── Pet draft helpers ───────────────────────────────────────────────────────

  const updatePetDraft = (key: string, patch: Partial<PetDraft>) =>
    setPetDrafts((ds) => ds.map((d) => (d.key === key ? { ...d, ...patch } : d)));

  const removePetDraft = (key: string) =>
    setPetDrafts((ds) => ds.filter((d) => d.key !== key));

  // ─── Reminder helpers ────────────────────────────────────────────────────────

  const updateReminder = (key: string, patch: Partial<ReminderDraft>) =>
    setReminders((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const removeReminder = (key: string) =>
    setReminders((rs) => rs.filter((r) => r.key !== key));

  const addReminder = () =>
    setReminders((rs) => [...rs, { key: uid(), name: '', frequency_days: 90, customDays: '', useCustom: false, enabled: true }]);

  // ─── Bowl helpers ────────────────────────────────────────────────────────────

  const updateBowl = (key: string, patch: Partial<BowlDraft>) =>
    setBowls((bs) => bs.map((b) => (b.key === key ? { ...b, ...patch } : b)));

  const removeBowl = (key: string) =>
    setBowls((bs) => bs.filter((b) => b.key !== key));

  // ─── Food helpers ─────────────────────────────────────────────────────────────

  const updateFood = (key: string, patch: Partial<FoodDraft>) =>
    setFoods((fs) => fs.map((f) => (f.key === key ? { ...f, ...patch } : f)));

  const removeFood = (key: string) =>
    setFoods((fs) => fs.filter((f) => f.key !== key));

  // ─── Loading ─────────────────────────────────────────────────────────────────

  if (initializing) {
    return (
      <View style={[styles.root, styles.centered]}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  const meta = STEP_META[currentStep];

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" backgroundColor={Colors.background} />

      {/* Progress bar */}
      <View style={styles.topBar} testID="onboarding-topbar">
        <Text style={styles.stepLabel}>
          Étape {stepIndex + 1} sur {STEPS.length}
        </Text>
        <View style={styles.progressRow}>
          {STEPS.map((s, i) => (
            <View key={s} style={styles.segmentWrapper}>
              <View style={[styles.segment, i < stepIndex && styles.segmentDone, i === stepIndex && styles.segmentActive]} />
              <Text style={[styles.segmentLabel, i === stepIndex && styles.segmentLabelActive]}>
                {STEP_META[s].icon}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerIcon}>{meta.icon}</Text>
          <Text style={styles.headerTitle}>{meta.title}</Text>
          <Text style={styles.headerSubtitle}>{meta.subtitle}</Text>
        </View>

        {/* ── STEP: pets ───────────────────────────────────────────────────── */}
        {currentStep === 'pets' && (
          <View>
            {existingPets.map((pet) => (
              <View key={pet.id} style={styles.existingPetCard}>
                <Text style={styles.existingPetName}>{pet.name}</Text>
                <Text style={styles.existingPetSub}>{pet.species}</Text>
              </View>
            ))}

            {petDrafts.map((draft) => (
              <View key={draft.key} style={styles.draftCard}>
                <View style={styles.draftCardHeader}>
                  <Text style={styles.draftCardTitle}>Nouvel animal</Text>
                  {(petDrafts.length > 1 || existingPets.length > 0) && (
                    <TouchableOpacity onPress={() => removePetDraft(draft.key)}>
                      <Text style={styles.removeBtn}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Nom"
                  placeholderTextColor={Colors.textMuted}
                  value={draft.name}
                  onChangeText={(v) => updatePetDraft(draft.key, { name: v })}
                />
                <View style={styles.pillRow}>
                  {SPECIES_OPTIONS.map((sp) => (
                    <TouchableOpacity
                      key={sp}
                      style={[styles.pill, draft.species === sp && styles.pillActive]}
                      onPress={() => updatePetDraft(draft.key, { species: sp })}
                    >
                      <Text style={[styles.pillText, draft.species === sp && styles.pillTextActive]}>{sp}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity
                  style={styles.dateBtn}
                  onPress={() => updatePetDraft(draft.key, { showPicker: true })}
                >
                  <Text style={draft.birth_date ? styles.dateBtnText : styles.dateBtnPlaceholder}>
                    {draft.birth_date || 'Date de naissance'}
                  </Text>
                </TouchableOpacity>
                {draft.showPicker && (
                  <DateTimePicker
                    value={draft.dateObj}
                    mode="date"
                    display="default"
                    maximumDate={new Date()}
                    onChange={(_e, d) => {
                      if (d) {
                        const iso = d.toISOString().slice(0, 10);
                        updatePetDraft(draft.key, { dateObj: d, birth_date: iso, showPicker: false });
                      } else {
                        updatePetDraft(draft.key, { showPicker: false });
                      }
                    }}
                  />
                )}
                <TextInput
                  style={[styles.input, { marginTop: Spacing.sm }]}
                  placeholder="Race (optionnel)"
                  placeholderTextColor={Colors.textMuted}
                  value={draft.breed}
                  onChangeText={(v) => updatePetDraft(draft.key, { breed: v })}
                />
              </View>
            ))}

            <TouchableOpacity style={styles.addBtn} onPress={() => setPetDrafts((ds) => [...ds, newPetDraft()])}>
              <Text style={styles.addBtnText}>+ Ajouter un animal</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── STEP: health ─────────────────────────────────────────────────── */}
        {currentStep === 'health' && (
          <View testID="onboarding-category-health">
            {reminders.map((r) => (
              <View key={r.key} style={[styles.draftCard, !r.enabled && styles.draftCardDisabled]}>
                <View style={styles.draftCardHeader}>
                  <TouchableOpacity
                    style={[styles.checkbox, r.enabled && styles.checkboxChecked]}
                    onPress={() => updateReminder(r.key, { enabled: !r.enabled })}
                    testID={r.name === 'Vermifuge' ? 'onboarding-health-deworming' :
                            r.name.startsWith('Anti') ? 'onboarding-health-flea' :
                            r.name === 'Vaccin annuel' ? 'onboarding-health-vaccine' : undefined}
                  >
                    {r.enabled && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                  <TextInput
                    style={[styles.reminderNameInput, !r.enabled && styles.textDisabled]}
                    value={r.name}
                    onChangeText={(v) => updateReminder(r.key, { name: v })}
                    placeholder="Nom du traitement / médicament"
                    placeholderTextColor={Colors.textMuted}
                  />
                  <TouchableOpacity onPress={() => removeReminder(r.key)}>
                    <Text style={styles.removeBtn}>✕</Text>
                  </TouchableOpacity>
                </View>
                {r.enabled && (
                  <View style={styles.freqRow}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.freqScroll}>
                      {FREQ_PRESETS.map((p) => (
                        <TouchableOpacity
                          key={p.days}
                          style={[styles.freqPill, !r.useCustom && r.frequency_days === p.days && styles.freqPillActive]}
                          onPress={() => updateReminder(r.key, { frequency_days: p.days, useCustom: false })}
                        >
                          <Text style={[styles.freqPillText, !r.useCustom && r.frequency_days === p.days && styles.freqPillTextActive]}>
                            {p.label}
                          </Text>
                        </TouchableOpacity>
                      ))}
                      <TouchableOpacity
                        style={[styles.freqPill, r.useCustom && styles.freqPillActive]}
                        onPress={() => updateReminder(r.key, { useCustom: true })}
                      >
                        <Text style={[styles.freqPillText, r.useCustom && styles.freqPillTextActive]}>Autre</Text>
                      </TouchableOpacity>
                    </ScrollView>
                    {r.useCustom && (
                      <View style={styles.customDaysRow}>
                        <TextInput
                          style={styles.customDaysInput}
                          value={r.customDays}
                          onChangeText={(v) => updateReminder(r.key, { customDays: v })}
                          placeholder="90"
                          placeholderTextColor={Colors.textMuted}
                          keyboardType="numeric"
                        />
                        <Text style={styles.customDaysLabel}>jours</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            ))}
            <TouchableOpacity style={styles.addBtn} onPress={addReminder}>
              <Text style={styles.addBtnText}>+ Ajouter un rappel</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── STEP: weight ─────────────────────────────────────────────────── */}
        {currentStep === 'weight' && (
          <View testID="onboarding-category-weight">
            {allPets.length === 0 ? (
              <Text style={styles.emptyHint}>Aucun animal dans le foyer.</Text>
            ) : (
              allPets.map((pet) => (
                <View key={pet.id} style={styles.weightCard}>
                  <Text style={styles.petName}>{pet.name}</Text>
                  <View style={styles.weightInputRow}>
                    <TextInput
                      style={styles.weightInput}
                      placeholder="?"
                      placeholderTextColor={Colors.textMuted}
                      value={weights[pet.id] ?? ''}
                      onChangeText={(v) => setWeights((w) => ({ ...w, [pet.id]: v }))}
                      keyboardType="numeric"
                      testID="onboarding-weight-entry"
                    />
                    <Text style={styles.weightUnit}>g</Text>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {/* ── STEP: bowls ──────────────────────────────────────────────────── */}
        {currentStep === 'bowls' && (
          <View>
            {bowls.map((b) => (
              <View key={b.key} style={styles.draftCard}>
                <View style={styles.draftCardHeader}>
                  <Text style={styles.draftCardTitle}>Gamelle</Text>
                  {bowls.length > 1 && (
                    <TouchableOpacity onPress={() => removeBowl(b.key)}>
                      <Text style={styles.removeBtn}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Nom (ex: Gamelle Lumi)"
                  placeholderTextColor={Colors.textMuted}
                  value={b.name}
                  onChangeText={(v) => updateBowl(b.key, { name: v })}
                  testID="onboarding-food-entry"
                />
                <TextInput
                  style={[styles.input, { marginTop: Spacing.sm }]}
                  placeholder="Emplacement (ex: Cuisine)"
                  placeholderTextColor={Colors.textMuted}
                  value={b.location}
                  onChangeText={(v) => updateBowl(b.key, { location: v })}
                />
                <View style={[styles.pillRow, { marginTop: Spacing.sm }]}>
                  <TouchableOpacity
                    style={[styles.pill, b.bowl_type === 'food' && styles.pillActive]}
                    onPress={() => updateBowl(b.key, { bowl_type: 'food' })}
                  >
                    <Text style={[styles.pillText, b.bowl_type === 'food' && styles.pillTextActive]}>🍽 Nourriture</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.pill, b.bowl_type === 'water' && styles.pillActive]}
                    onPress={() => updateBowl(b.key, { bowl_type: 'water' })}
                  >
                    <Text style={[styles.pillText, b.bowl_type === 'water' && styles.pillTextActive]}>💧 Eau</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <TouchableOpacity style={styles.addBtn} onPress={() => setBowls((bs) => [...bs, newBowlDraft()])}>
              <Text style={styles.addBtnText}>+ Ajouter une gamelle</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── STEP: food ───────────────────────────────────────────────────── */}
        {currentStep === 'food' && (
          <View>
            {foods.length === 0 && (
              <Text style={styles.emptyHint}>Aucun produit ajouté — passez cette étape si vous n'avez pas encore de stock.</Text>
            )}
            {foods.map((f) => (
              <View key={f.key} style={styles.draftCard}>
                <View style={styles.draftCardHeader}>
                  <Text style={styles.draftCardTitle}>Produit</Text>
                  <TouchableOpacity onPress={() => removeFood(f.key)}>
                    <Text style={styles.removeBtn}>✕</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Nom du produit (ex: Royal Canin Adulte)"
                  placeholderTextColor={Colors.textMuted}
                  value={f.name}
                  onChangeText={(v) => updateFood(f.key, { name: v })}
                />
                <TextInput
                  style={[styles.input, { marginTop: Spacing.sm }]}
                  placeholder="Marque"
                  placeholderTextColor={Colors.textMuted}
                  value={f.brand}
                  onChangeText={(v) => updateFood(f.key, { brand: v })}
                />
                <View style={[styles.pillRow, { marginTop: Spacing.sm }]}>
                  {(['dry', 'wet', 'mixed'] as const).map((t) => {
                    const label = t === 'dry' ? '🥨 Croquettes' : t === 'wet' ? '🥫 Pâtée' : '🍱 Mixte';
                    return (
                      <TouchableOpacity
                        key={t}
                        style={[styles.pill, f.food_type === t && styles.pillActive]}
                        onPress={() => updateFood(f.key, { food_type: t })}
                      >
                        <Text style={[styles.pillText, f.food_type === t && styles.pillTextActive]}>{label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <View style={[styles.weightInputRow, { marginTop: Spacing.sm }]}>
                  <TextInput
                    style={[styles.weightInput, { width: 100 }]}
                    placeholder="Poids sac"
                    placeholderTextColor={Colors.textMuted}
                    value={f.bag_weight_g}
                    onChangeText={(v) => updateFood(f.key, { bag_weight_g: v })}
                    keyboardType="numeric"
                  />
                  <Text style={styles.weightUnit}>g en stock</Text>
                </View>
              </View>
            ))}
            <TouchableOpacity style={styles.addBtn} onPress={() => setFoods((fs) => [...fs, newFoodDraft()])}>
              <Text style={styles.addBtnText}>+ Ajouter un produit</Text>
            </TouchableOpacity>
          </View>
        )}

        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveBtn, loading && styles.saveBtnDisabled]}
          onPress={handleSave}
          disabled={loading}
          activeOpacity={0.8}
          testID="onboarding-actions-save"
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveBtnText}>
              {isLastStep ? 'Terminer la configuration' : 'Enregistrer et suivant'}
            </Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.skipBtn}
          onPress={advance}
          activeOpacity={0.7}
          testID="onboarding-actions-skip"
        >
          <Text style={styles.skipBtnText}>
            {isLastStep ? 'Passer et aller au tableau de bord' : 'Passer cette étape'}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  centered: { alignItems: 'center', justifyContent: 'center' },
  topBar: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.background,
  },
  stepLabel: { fontSize: 12, fontWeight: '500', color: Colors.textMuted, marginBottom: Spacing.sm },
  progressRow: { flexDirection: 'row', gap: Spacing.sm },
  segmentWrapper: { flex: 1, alignItems: 'center', gap: 4 },
  segment: { width: '100%', height: 4, borderRadius: Radius.full, backgroundColor: Colors.border },
  segmentActive: { backgroundColor: Colors.primary },
  segmentDone: { backgroundColor: Colors.secondary },
  segmentLabel: { fontSize: 14, color: Colors.textMuted },
  segmentLabelActive: { color: Colors.primary },
  scroll: { padding: Spacing.xl, paddingBottom: Spacing.md },
  header: { alignItems: 'center', marginBottom: Spacing.xl },
  headerIcon: { fontSize: 48, marginBottom: Spacing.sm },
  headerTitle: { ...Typography.h2, marginBottom: Spacing.xs },
  headerSubtitle: { fontSize: 14, color: Colors.textSecondary, textAlign: 'center', lineHeight: 20 },

  // Cards
  draftCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  draftCardDisabled: { opacity: 0.55 },
  draftCardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm, gap: Spacing.sm },
  draftCardTitle: { fontSize: 12, fontWeight: '600', color: Colors.textMuted, flex: 1 },
  removeBtn: { fontSize: 16, color: Colors.textMuted, paddingHorizontal: 4 },

  existingPetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  existingPetName: { fontSize: 15, fontWeight: '600', color: Colors.primary, flex: 1 },
  existingPetSub: { fontSize: 13, color: Colors.textSecondary },

  // Inputs
  input: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  reminderNameInput: {
    flex: 1,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  textDisabled: { color: Colors.textMuted },

  // Pills
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  pillActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  pillText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  pillTextActive: { color: Colors.primary, fontWeight: '700' },

  // Date button
  dateBtn: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
  },
  dateBtnText: { fontSize: 14, color: Colors.textPrimary },
  dateBtnPlaceholder: { fontSize: 14, color: Colors.textMuted },

  // Frequency
  freqRow: { marginTop: Spacing.sm },
  freqScroll: { flexGrow: 0 },
  freqPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    marginRight: Spacing.sm,
  },
  freqPillActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  freqPillText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
  freqPillTextActive: { color: Colors.primary, fontWeight: '700' },
  customDaysRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm, gap: Spacing.sm },
  customDaysInput: {
    width: 70,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 8,
    fontSize: 14,
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  customDaysLabel: { fontSize: 13, color: Colors.textSecondary },

  // Checkbox
  checkbox: {
    width: 22, height: 22,
    borderRadius: Radius.sm,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  checkmark: { color: '#fff', fontSize: 12, fontWeight: '700' },

  // Weight
  weightCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  petName: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary, flex: 1 },
  weightInputRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  weightInput: {
    width: 80,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 15,
    color: Colors.textPrimary,
    textAlign: 'right',
  },
  weightUnit: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },

  // Add button
  addBtn: {
    borderWidth: 1.5,
    borderColor: Colors.primary,
    borderStyle: 'dashed',
    borderRadius: Radius.md,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  addBtnText: { fontSize: 14, color: Colors.primary, fontWeight: '600' },

  emptyHint: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', marginVertical: Spacing.xl, lineHeight: 22 },

  errorBox: { backgroundColor: `${Colors.error}18`, borderRadius: Radius.md, padding: Spacing.md, marginTop: Spacing.md },
  errorText: { fontSize: 13, color: Colors.error },

  footer: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 28,
    paddingTop: Spacing.sm,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: Spacing.sm,
  },
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 16,
    alignItems: 'center',
    ...Shadow.card,
  },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  skipBtn: { alignItems: 'center', paddingVertical: 10 },
  skipBtnText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
});
