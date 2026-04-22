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
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { StackScreenProps } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Colors, Radius, Spacing, Shadow, Typography } from '../constants/theme';
import { dataService } from '../store/dataService';
import { OnboardingState, ModuleConfig } from '../store/onboardingState';
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

interface LitterDraft {
  key: string;
  name: string;
  color: string;
}

interface BowlDraft {
  key: string;
  name: string;
  location: string;
  bowl_type: 'food' | 'water';
  capacity_g: string;
  capacity_ml: string;
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

const LITTER_COLORS = ['#A8D8A8', '#FFD3B5', '#D4A5FF', '#AECBFA', '#FFADAD', '#FFF3B0'];

const MODULE_CONFIG: { key: keyof ModuleConfig; icon: string; label: string; desc: string }[] = [
  { key: 'health', icon: '💊', label: 'Rappels santé', desc: 'Vermifuge, vaccins, traitements' },
  { key: 'litter', icon: '🚽', label: 'Litière', desc: 'Suivi nettoyage par bac' },
  { key: 'bowls', icon: '🥣', label: 'Gamelles', desc: 'Suivi des repas par gamelle' },
  { key: 'food', icon: '🛒', label: 'Stock alimentaire', desc: 'Produits et sacs en cours' },
];

// Only the steps that are always present; dynamic ones inserted based on modules
type AnyStep = 'pets' | 'modules' | 'health' | 'weight' | 'litter' | 'bowls' | 'food';

const STEP_META: Record<AnyStep, { icon: string; title: string; subtitle: string }> = {
  pets: { icon: '🐾', title: 'Vos animaux', subtitle: 'Ajoutez les animaux de votre foyer' },
  modules: { icon: '⚙️', title: 'Ce que vous voulez suivre', subtitle: 'Activez uniquement ce dont vous avez besoin' },
  health: { icon: '💊', title: 'Rappels santé', subtitle: 'Personnalisez les rappels et traitements' },
  weight: { icon: '⚖️', title: 'Poids initial', subtitle: "Notez un poids de départ pour chaque animal" },
  litter: { icon: '🚽', title: 'Litières', subtitle: 'Configurez les bacs à litière du foyer' },
  bowls: { icon: '🥣', title: 'Gamelles', subtitle: 'Configurez les gamelles du foyer' },
  food: { icon: '🛒', title: 'Stocks & produits', subtitle: 'Enregistrez vos produits alimentaires en cours' },
};

function newPetDraft(): PetDraft {
  return { key: uid(), name: '', species: '', birth_date: '', dateObj: new Date(2020, 0, 1), showPicker: false, breed: '' };
}
function newLitterDraft(): LitterDraft {
  return { key: uid(), name: '', color: LITTER_COLORS[0] };
}
function newBowlDraft(): BowlDraft {
  return { key: uid(), name: '', location: '', bowl_type: 'food', capacity_g: '', capacity_ml: '' };
}
function newFoodDraft(): FoodDraft {
  return { key: uid(), name: '', brand: '', food_type: 'dry', bag_weight_g: '' };
}

function buildSteps(modules: ModuleConfig): AnyStep[] {
  const steps: AnyStep[] = ['pets', 'modules'];
  if (modules.health) steps.push('health');
  steps.push('weight');
  if (modules.litter) steps.push('litter');
  if (modules.bowls) steps.push('bowls');
  if (modules.food) steps.push('food');
  return steps;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function OnboardingAdminScreen({ navigation, route }: Props) {
  const fromSettings = route.params?.fromSettings ?? false;

  const [stepIndex, setStepIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [existingPets, setExistingPets] = useState<Pet[]>([]);
  const [petDrafts, setPetDrafts] = useState<PetDraft[]>([]);
  const [allPets, setAllPets] = useState<Pet[]>([]);

  const [modules, setModules] = useState<ModuleConfig>({ health: true, litter: true, bowls: true, food: false });

  const updateModules = (patch: Partial<ModuleConfig>) => {
    setModules((prev) => { const next = { ...prev, ...patch }; OnboardingState.setModules(next); return next; });
  };
  const [reminders, setReminders] = useState<ReminderDraft[]>(SUGGESTED_REMINDERS.map((r) => ({ ...r, key: uid() })));
  const [weights, setWeights] = useState<Record<string, string>>({});
  const [litters, setLitters] = useState<LitterDraft[]>([newLitterDraft()]);
  const [bowls, setBowls] = useState<BowlDraft[]>([newBowlDraft()]);
  const [foods, setFoods] = useState<FoodDraft[]>([]);

  const steps = buildSteps(modules);
  const currentStep = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  useEffect(() => {
    Promise.all([dataService.getPets(), OnboardingState.getModules()])
      .then(([pets, savedModules]) => {
        setExistingPets(pets);
        setAllPets(pets);
        if (pets.length === 0) setPetDrafts([newPetDraft()]);
        setModules(savedModules);
      })
      .catch(() => {})
      .finally(() => setInitializing(false));
  }, []);

  // ─── Helpers ─────────────────────────────────────────────────────────────────

  const updatePetDraft = (key: string, patch: Partial<PetDraft>) =>
    setPetDrafts((ds) => ds.map((d) => (d.key === key ? { ...d, ...patch } : d)));
  const removePetDraft = (key: string) =>
    setPetDrafts((ds) => ds.filter((d) => d.key !== key));

  const updateReminder = (key: string, patch: Partial<ReminderDraft>) =>
    setReminders((rs) => rs.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  const removeReminder = (key: string) =>
    setReminders((rs) => rs.filter((r) => r.key !== key));

  const updateLitter = (key: string, patch: Partial<LitterDraft>) =>
    setLitters((ls) => ls.map((l) => (l.key === key ? { ...l, ...patch } : l)));
  const removeLitter = (key: string) =>
    setLitters((ls) => ls.filter((l) => l.key !== key));

  const updateBowl = (key: string, patch: Partial<BowlDraft>) =>
    setBowls((bs) => bs.map((b) => (b.key === key ? { ...b, ...patch } : b)));
  const removeBowl = (key: string) =>
    setBowls((bs) => bs.filter((b) => b.key !== key));

  const updateFood = (key: string, patch: Partial<FoodDraft>) =>
    setFoods((fs) => fs.map((f) => (f.key === key ? { ...f, ...patch } : f)));
  const removeFood = (key: string) =>
    setFoods((fs) => fs.filter((f) => f.key !== key));

  // ─── Reset ───────────────────────────────────────────────────────────────────

  const handleReset = () => {
    Alert.alert(
      'Recommencer la configuration',
      'Cela réinitialise uniquement l\'état de l\'assistant d\'installation. Vos données existantes (animaux, gamelles, etc.) ne sont pas supprimées.',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Recommencer',
          style: 'destructive',
          onPress: async () => {
            await OnboardingState.reset();
            setStepIndex(0);
            setPetDrafts(existingPets.length === 0 ? [newPetDraft()] : []);
            setModules({ health: true, litter: true, bowls: true, food: false });
            setReminders(SUGGESTED_REMINDERS.map((r) => ({ ...r, key: uid() })));
            setWeights({});
            setLitters([newLitterDraft()]);
            setBowls([newBowlDraft()]);
            setFoods([]);
            setError(null);
          },
        },
      ]
    );
  };

  // ─── Save ────────────────────────────────────────────────────────────────────

  const handleSave = async () => {
    setError(null);
    setLoading(true);
    try {
      if (currentStep === 'pets') {
        const valid = petDrafts.filter((d) => d.name.trim() && d.species.trim() && d.birth_date.trim());
        if (existingPets.length === 0 && valid.length === 0) {
          setError('Ajoutez au moins un animal pour continuer.');
          setLoading(false);
          return;
        }
        const created = await Promise.all(
          valid.map((d) =>
            dataService.createPet({ name: d.name.trim(), species: d.species.trim(), birth_date: d.birth_date, breed: d.breed.trim() || undefined })
          )
        );
        setAllPets([...existingPets, ...created]);
        await OnboardingState.markDone('pets');

      } else if (currentStep === 'modules') {
        await OnboardingState.markDone('modules');

      } else if (currentStep === 'health') {
        const active = reminders.filter((r) => r.enabled && r.name.trim());
        const freq = (r: ReminderDraft) => r.useCustom ? (parseInt(r.customDays, 10) || 30) : r.frequency_days;
        await Promise.all(
          active.flatMap((r) =>
            allPets.map((pet) =>
              dataService.createReminder(pet.id, { name: r.name.trim(), frequency_days: freq(r), type: 'health' })
            )
          )
        );
        await OnboardingState.markDone('health');

      } else if (currentStep === 'weight') {
        await Promise.all(
          allPets
            .filter((pet) => { const g = parseFloat(weights[pet.id] ?? ''); return !isNaN(g) && g > 0; })
            .map((pet) => dataService.logEvent(pet.id, 'weight', { grams: parseFloat(weights[pet.id]) }))
        );
        await OnboardingState.markDone('weight');

      } else if (currentStep === 'litter') {
        await Promise.all(
          litters
            .filter((l) => l.name.trim())
            .map((l) => dataService.createResource({ name: l.name.trim(), type: 'litter', color: l.color }))
        );
        await OnboardingState.markDone('litter');

      } else if (currentStep === 'bowls') {
        await Promise.all(
          bowls
            .filter((b) => b.name.trim())
            .map((b) =>
              dataService.createBowl({
                name: b.name.trim(),
                location: b.location.trim() || 'Cuisine',
                bowl_type: b.bowl_type,
                capacity_g: b.capacity_g ? parseInt(b.capacity_g, 10) : undefined,
                capacity_ml: b.capacity_ml ? parseInt(b.capacity_ml, 10) : undefined,
              })
            )
        );
        await OnboardingState.markDone('bowls');

      } else if (currentStep === 'food') {
        await Promise.all(
          foods.filter((f) => f.name.trim()).map(async (f) => {
            const product = await dataService.createFoodProduct({
              name: f.name.trim(),
              brand: f.brand.trim() || 'Autre',
              food_type: f.food_type,
              food_category: 'cat',
            });
            const g = parseInt(f.bag_weight_g, 10);
            if (!isNaN(g) && g > 0) {
              await dataService.createFoodBag({ product_id: product.id, weight_g: g, purchased_at: new Date().toISOString().slice(0, 10) });
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
    if (isLastStep) finish();
    else { setStepIndex((i) => i + 1); setError(null); }
  };

  const finish = () => {
    if (fromSettings) navigation.goBack();
    else navigation.navigate('Dashboard');
  };

  // ─── Render ──────────────────────────────────────────────────────────────────

  if (initializing) {
    return <View style={[styles.root, styles.centered]}><ActivityIndicator color={Colors.primary} size="large" /></View>;
  }

  const meta = STEP_META[currentStep];

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="dark" backgroundColor={Colors.background} />

      {/* Progress */}
      <View style={styles.topBar} testID="onboarding-topbar">
        <View style={styles.topBarRow}>
          <Text style={styles.stepLabel}>Étape {stepIndex + 1} sur {steps.length}</Text>
          <TouchableOpacity onPress={handleReset} style={styles.resetBtn}>
            <Text style={styles.resetBtnText}>↺ Recommencer</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.progressRow}>
          {steps.map((s, i) => (
            <View key={s} style={styles.segmentWrapper}>
              <View style={[styles.segment, i < stepIndex && styles.segmentDone, i === stepIndex && styles.segmentActive]} />
              <Text style={[styles.segmentLabel, i === stepIndex && styles.segmentLabelActive]}>{STEP_META[s].icon}</Text>
            </View>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerIcon}>{meta.icon}</Text>
          <Text style={styles.headerTitle}>{meta.title}</Text>
          <Text style={styles.headerSubtitle}>{meta.subtitle}</Text>
        </View>

        {/* ── PETS ─────────────────────────────────────────────────────────── */}
        {currentStep === 'pets' && (
          <View>
            {existingPets.map((pet) => (
              <View key={pet.id} style={styles.existingCard}>
                <Text style={styles.existingName}>{pet.name}</Text>
                <Text style={styles.existingSub}>{pet.species}</Text>
              </View>
            ))}
            {petDrafts.map((draft) => (
              <View key={draft.key} style={styles.draftCard}>
                <View style={styles.draftHeader}>
                  <Text style={styles.draftTitle}>Nouvel animal</Text>
                  {(petDrafts.length > 1 || existingPets.length > 0) && (
                    <TouchableOpacity onPress={() => removePetDraft(draft.key)}><Text style={styles.removeBtn}>✕</Text></TouchableOpacity>
                  )}
                </View>
                <TextInput style={styles.input} placeholder="Nom" placeholderTextColor={Colors.textMuted} value={draft.name} onChangeText={(v) => updatePetDraft(draft.key, { name: v })} />
                <View style={[styles.pillRow, { marginTop: Spacing.sm }]}>
                  {SPECIES_OPTIONS.map((sp) => (
                    <TouchableOpacity key={sp} style={[styles.pill, draft.species === sp && styles.pillActive]} onPress={() => updatePetDraft(draft.key, { species: sp })}>
                      <Text style={[styles.pillText, draft.species === sp && styles.pillTextActive]}>{sp}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity style={[styles.input, { marginTop: Spacing.sm, justifyContent: 'center' }]} onPress={() => updatePetDraft(draft.key, { showPicker: true })}>
                  <Text style={draft.birth_date ? styles.inputText : styles.inputPlaceholder}>{draft.birth_date || 'Date de naissance'}</Text>
                </TouchableOpacity>
                {draft.showPicker && (
                  <DateTimePicker value={draft.dateObj} mode="date" display="default" maximumDate={new Date()}
                    onChange={(_e, d) => {
                      if (d) updatePetDraft(draft.key, { dateObj: d, birth_date: d.toISOString().slice(0, 10), showPicker: false });
                      else updatePetDraft(draft.key, { showPicker: false });
                    }} />
                )}
                <TextInput style={[styles.input, { marginTop: Spacing.sm }]} placeholder="Race (optionnel)" placeholderTextColor={Colors.textMuted} value={draft.breed} onChangeText={(v) => updatePetDraft(draft.key, { breed: v })} />
              </View>
            ))}
            <TouchableOpacity style={styles.addBtn} onPress={() => setPetDrafts((ds) => [...ds, newPetDraft()])}>
              <Text style={styles.addBtnText}>+ Ajouter un animal</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── MODULES ──────────────────────────────────────────────────────── */}
        {currentStep === 'modules' && (
          <View>
            {MODULE_CONFIG.map((m) => (
              <TouchableOpacity
                key={m.key}
                style={[styles.moduleCard, modules[m.key] && styles.moduleCardActive]}
                onPress={() => updateModules({ [m.key]: !modules[m.key] })}
                activeOpacity={0.7}
              >
                <Text style={styles.moduleIcon}>{m.icon}</Text>
                <View style={styles.moduleBody}>
                  <Text style={[styles.moduleName, modules[m.key] && styles.moduleNameActive]}>{m.label}</Text>
                  <Text style={styles.moduleDesc}>{m.desc}</Text>
                </View>
                <View style={[styles.toggle, modules[m.key] && styles.toggleActive]}>
                  <View style={[styles.toggleThumb, modules[m.key] && styles.toggleThumbActive]} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── HEALTH ───────────────────────────────────────────────────────── */}
        {currentStep === 'health' && (
          <View testID="onboarding-category-health">
            {reminders.map((r) => (
              <View key={r.key} style={[styles.draftCard, !r.enabled && styles.draftCardDim]}>
                <View style={styles.draftHeader}>
                  <TouchableOpacity
                    style={[styles.checkbox, r.enabled && styles.checkboxChecked]}
                    onPress={() => updateReminder(r.key, { enabled: !r.enabled })}
                    testID={r.name === 'Vermifuge' ? 'onboarding-health-deworming' : r.name.startsWith('Anti') ? 'onboarding-health-flea' : r.name === 'Vaccin annuel' ? 'onboarding-health-vaccine' : undefined}
                  >
                    {r.enabled && <Text style={styles.checkmark}>✓</Text>}
                  </TouchableOpacity>
                  <TextInput
                    style={[styles.inlineInput, !r.enabled && styles.textDim]}
                    value={r.name}
                    onChangeText={(v) => updateReminder(r.key, { name: v })}
                    placeholder="Nom du traitement / médicament"
                    placeholderTextColor={Colors.textMuted}
                  />
                  <TouchableOpacity onPress={() => removeReminder(r.key)}><Text style={styles.removeBtn}>✕</Text></TouchableOpacity>
                </View>
                {r.enabled && (
                  <View style={{ marginTop: Spacing.sm }}>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {FREQ_PRESETS.map((p) => (
                        <TouchableOpacity key={p.days} style={[styles.freqPill, !r.useCustom && r.frequency_days === p.days && styles.freqPillActive]}
                          onPress={() => updateReminder(r.key, { frequency_days: p.days, useCustom: false })}>
                          <Text style={[styles.freqPillText, !r.useCustom && r.frequency_days === p.days && styles.freqPillTextActive]}>{p.label}</Text>
                        </TouchableOpacity>
                      ))}
                      <TouchableOpacity style={[styles.freqPill, r.useCustom && styles.freqPillActive]} onPress={() => updateReminder(r.key, { useCustom: true })}>
                        <Text style={[styles.freqPillText, r.useCustom && styles.freqPillTextActive]}>Autre</Text>
                      </TouchableOpacity>
                    </ScrollView>
                    {r.useCustom && (
                      <View style={styles.customRow}>
                        <TextInput style={styles.customInput} value={r.customDays} onChangeText={(v) => updateReminder(r.key, { customDays: v })} placeholder="90" placeholderTextColor={Colors.textMuted} keyboardType="numeric" />
                        <Text style={styles.customLabel}>jours</Text>
                      </View>
                    )}
                  </View>
                )}
              </View>
            ))}
            <TouchableOpacity style={styles.addBtn} onPress={() => setReminders((rs) => [...rs, { key: uid(), name: '', frequency_days: 90, customDays: '', useCustom: false, enabled: true }])}>
              <Text style={styles.addBtnText}>+ Ajouter un rappel</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── WEIGHT ───────────────────────────────────────────────────────── */}
        {currentStep === 'weight' && (
          <View testID="onboarding-category-weight">
            {allPets.length === 0
              ? <Text style={styles.emptyHint}>Aucun animal dans le foyer.</Text>
              : allPets.map((pet) => (
                <View key={pet.id} style={styles.weightCard}>
                  <Text style={styles.petName}>{pet.name}</Text>
                  <View style={styles.weightRow}>
                    <TextInput style={styles.weightInput} placeholder="?" placeholderTextColor={Colors.textMuted} value={weights[pet.id] ?? ''} onChangeText={(v) => setWeights((w) => ({ ...w, [pet.id]: v }))} keyboardType="numeric" testID="onboarding-weight-entry" />
                    <Text style={styles.weightUnit}>g</Text>
                  </View>
                </View>
              ))
            }
          </View>
        )}

        {/* ── LITTER ───────────────────────────────────────────────────────── */}
        {currentStep === 'litter' && (
          <View>
            {litters.map((l) => (
              <View key={l.key} style={styles.draftCard}>
                <View style={styles.draftHeader}>
                  <Text style={styles.draftTitle}>Bac à litière</Text>
                  {litters.length > 1 && <TouchableOpacity onPress={() => removeLitter(l.key)}><Text style={styles.removeBtn}>✕</Text></TouchableOpacity>}
                </View>
                <TextInput style={styles.input} placeholder="Nom (ex: Litière salon)" placeholderTextColor={Colors.textMuted} value={l.name} onChangeText={(v) => updateLitter(l.key, { name: v })} />
                <View style={[styles.pillRow, { marginTop: Spacing.sm }]}>
                  {LITTER_COLORS.map((c) => (
                    <TouchableOpacity key={c} style={[styles.colorDot, { backgroundColor: c }, l.color === c && styles.colorDotActive]} onPress={() => updateLitter(l.key, { color: c })} />
                  ))}
                </View>
              </View>
            ))}
            <TouchableOpacity style={styles.addBtn} onPress={() => setLitters((ls) => [...ls, newLitterDraft()])}>
              <Text style={styles.addBtnText}>+ Ajouter un bac</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── BOWLS ────────────────────────────────────────────────────────── */}
        {currentStep === 'bowls' && (
          <View>
            {bowls.map((b) => (
              <View key={b.key} style={styles.draftCard}>
                <View style={styles.draftHeader}>
                  <Text style={styles.draftTitle}>Gamelle</Text>
                  {bowls.length > 1 && <TouchableOpacity onPress={() => removeBowl(b.key)}><Text style={styles.removeBtn}>✕</Text></TouchableOpacity>}
                </View>
                <TextInput style={styles.input} placeholder="Nom (ex: Gamelle Lumi)" placeholderTextColor={Colors.textMuted} value={b.name} onChangeText={(v) => updateBowl(b.key, { name: v })} testID="onboarding-food-entry" />
                <TextInput style={[styles.input, { marginTop: Spacing.sm }]} placeholder="Emplacement (ex: Cuisine)" placeholderTextColor={Colors.textMuted} value={b.location} onChangeText={(v) => updateBowl(b.key, { location: v })} />
                <View style={[styles.pillRow, { marginTop: Spacing.sm }]}>
                  <TouchableOpacity style={[styles.pill, b.bowl_type === 'food' && styles.pillActive]} onPress={() => updateBowl(b.key, { bowl_type: 'food' })}>
                    <Text style={[styles.pillText, b.bowl_type === 'food' && styles.pillTextActive]}>🍽 Nourriture</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.pill, b.bowl_type === 'water' && styles.pillActive]} onPress={() => updateBowl(b.key, { bowl_type: 'water' })}>
                    <Text style={[styles.pillText, b.bowl_type === 'water' && styles.pillTextActive]}>💧 Eau</Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.capacityRow}>
                  <View style={styles.capacityField}>
                    <Text style={styles.capacityLabel}>Capacité (g)</Text>
                    <TextInput style={styles.capacityInput} placeholder="ex: 200" placeholderTextColor={Colors.textMuted} value={b.capacity_g} onChangeText={(v) => updateBowl(b.key, { capacity_g: v })} keyboardType="numeric" />
                  </View>
                  <View style={styles.capacityField}>
                    <Text style={styles.capacityLabel}>Capacité (ml)</Text>
                    <TextInput style={styles.capacityInput} placeholder="ex: 250" placeholderTextColor={Colors.textMuted} value={b.capacity_ml} onChangeText={(v) => updateBowl(b.key, { capacity_ml: v })} keyboardType="numeric" />
                  </View>
                </View>
              </View>
            ))}
            <TouchableOpacity style={styles.addBtn} onPress={() => setBowls((bs) => [...bs, newBowlDraft()])}>
              <Text style={styles.addBtnText}>+ Ajouter une gamelle</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── FOOD ─────────────────────────────────────────────────────────── */}
        {currentStep === 'food' && (
          <View>
            {foods.length === 0 && <Text style={styles.emptyHint}>Aucun produit — passez si vous n'avez pas encore de stock.</Text>}
            {foods.map((f) => (
              <View key={f.key} style={styles.draftCard}>
                <View style={styles.draftHeader}>
                  <Text style={styles.draftTitle}>Produit</Text>
                  <TouchableOpacity onPress={() => removeFood(f.key)}><Text style={styles.removeBtn}>✕</Text></TouchableOpacity>
                </View>
                <TextInput style={styles.input} placeholder="Nom (ex: Royal Canin Adulte)" placeholderTextColor={Colors.textMuted} value={f.name} onChangeText={(v) => updateFood(f.key, { name: v })} />
                <TextInput style={[styles.input, { marginTop: Spacing.sm }]} placeholder="Marque" placeholderTextColor={Colors.textMuted} value={f.brand} onChangeText={(v) => updateFood(f.key, { brand: v })} />
                <View style={[styles.pillRow, { marginTop: Spacing.sm }]}>
                  {(['dry', 'wet', 'mixed'] as const).map((t) => {
                    const lbl = t === 'dry' ? '🥨 Croquettes' : t === 'wet' ? '🥫 Pâtée' : '🍱 Mixte';
                    return (
                      <TouchableOpacity key={t} style={[styles.pill, f.food_type === t && styles.pillActive]} onPress={() => updateFood(f.key, { food_type: t })}>
                        <Text style={[styles.pillText, f.food_type === t && styles.pillTextActive]}>{lbl}</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
                <View style={[styles.weightRow, { marginTop: Spacing.sm }]}>
                  <TextInput style={[styles.weightInput, { width: 100 }]} placeholder="Poids sac" placeholderTextColor={Colors.textMuted} value={f.bag_weight_g} onChangeText={(v) => updateFood(f.key, { bag_weight_g: v })} keyboardType="numeric" />
                  <Text style={styles.weightUnit}>g en stock</Text>
                </View>
              </View>
            ))}
            <TouchableOpacity style={styles.addBtn} onPress={() => setFoods((fs) => [...fs, newFoodDraft()])}>
              <Text style={styles.addBtnText}>+ Ajouter un produit</Text>
            </TouchableOpacity>
          </View>
        )}

        {error && <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View>}
      </ScrollView>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity style={[styles.saveBtn, loading && styles.saveBtnDisabled]} onPress={handleSave} disabled={loading} activeOpacity={0.8} testID="onboarding-actions-save">
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>{isLastStep ? 'Terminer la configuration' : 'Enregistrer et suivant'}</Text>}
        </TouchableOpacity>
        <TouchableOpacity style={styles.skipBtn} onPress={advance} activeOpacity={0.7} testID="onboarding-actions-skip">
          <Text style={styles.skipBtnText}>{isLastStep ? 'Passer et aller au tableau de bord' : 'Passer cette étape'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  centered: { alignItems: 'center', justifyContent: 'center' },

  topBar: { paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing.md, backgroundColor: Colors.background },
  topBarRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.sm },
  stepLabel: { fontSize: 12, fontWeight: '500', color: Colors.textMuted },
  resetBtn: { paddingVertical: 4, paddingHorizontal: Spacing.sm },
  resetBtnText: { fontSize: 12, color: Colors.textMuted },
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

  existingCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.primaryLight,
    borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm,
    borderWidth: 1, borderColor: Colors.primary,
  },
  existingName: { fontSize: 15, fontWeight: '600', color: Colors.primary, flex: 1 },
  existingSub: { fontSize: 13, color: Colors.textSecondary },

  draftCard: {
    backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md,
    marginBottom: Spacing.md, borderWidth: 1, borderColor: Colors.border, ...Shadow.card,
  },
  draftCardDim: { opacity: 0.55 },
  draftHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm, gap: Spacing.sm },
  draftTitle: { fontSize: 12, fontWeight: '600', color: Colors.textMuted, flex: 1 },
  removeBtn: { fontSize: 16, color: Colors.textMuted, paddingHorizontal: 4 },

  // Module cards
  moduleCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm,
    borderWidth: 1.5, borderColor: Colors.border, ...Shadow.card,
  },
  moduleCardActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  moduleIcon: { fontSize: 28, marginRight: Spacing.md },
  moduleBody: { flex: 1 },
  moduleName: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary, marginBottom: 2 },
  moduleNameActive: { color: Colors.primary },
  moduleDesc: { fontSize: 12, color: Colors.textSecondary },
  toggle: { width: 44, height: 24, borderRadius: 12, backgroundColor: Colors.border, justifyContent: 'center', paddingHorizontal: 2 },
  toggleActive: { backgroundColor: Colors.primary },
  toggleThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff', alignSelf: 'flex-start' },
  toggleThumbActive: { alignSelf: 'flex-end' },

  input: {
    backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 10,
    fontSize: 14, color: Colors.textPrimary,
  },
  inputText: { fontSize: 14, color: Colors.textPrimary },
  inputPlaceholder: { fontSize: 14, color: Colors.textMuted },
  inlineInput: {
    flex: 1, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.md, paddingHorizontal: Spacing.sm, paddingVertical: 8,
    fontSize: 14, color: Colors.textPrimary,
  },
  textDim: { color: Colors.textMuted },

  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  pill: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface },
  pillActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  pillText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  pillTextActive: { color: Colors.primary, fontWeight: '700' },

  colorDot: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: 'transparent' },
  colorDotActive: { borderColor: Colors.textPrimary },

  checkbox: { width: 22, height: 22, borderRadius: Radius.sm, borderWidth: 2, borderColor: Colors.border, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { borderColor: Colors.primary, backgroundColor: Colors.primary },
  checkmark: { color: '#fff', fontSize: 12, fontWeight: '700' },

  freqPill: { paddingHorizontal: Spacing.md, paddingVertical: 6, borderRadius: Radius.full, borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.surface, marginRight: Spacing.sm },
  freqPillActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  freqPillText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
  freqPillTextActive: { color: Colors.primary, fontWeight: '700' },
  customRow: { flexDirection: 'row', alignItems: 'center', marginTop: Spacing.sm, gap: Spacing.sm },
  customInput: { width: 70, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: Spacing.sm, paddingVertical: 8, fontSize: 14, color: Colors.textPrimary, textAlign: 'center' },
  customLabel: { fontSize: 13, color: Colors.textSecondary },

  weightCard: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: Colors.surface, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm, borderWidth: 1, borderColor: Colors.border, ...Shadow.card },
  petName: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary, flex: 1 },
  weightRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  weightInput: { width: 80, backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: 10, paddingVertical: 8, fontSize: 15, color: Colors.textPrimary, textAlign: 'right' },
  weightUnit: { fontSize: 13, color: Colors.textSecondary, fontWeight: '600' },

  capacityRow: { flexDirection: 'row', gap: Spacing.md, marginTop: Spacing.sm },
  capacityField: { flex: 1 },
  capacityLabel: { fontSize: 11, color: Colors.textMuted, marginBottom: 4 },
  capacityInput: { backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.md, paddingHorizontal: Spacing.sm, paddingVertical: 8, fontSize: 14, color: Colors.textPrimary, textAlign: 'center' },

  addBtn: { borderWidth: 1.5, borderColor: Colors.primary, borderStyle: 'dashed', borderRadius: Radius.md, paddingVertical: 12, alignItems: 'center', marginBottom: Spacing.md },
  addBtnText: { fontSize: 14, color: Colors.primary, fontWeight: '600' },

  emptyHint: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', marginVertical: Spacing.xl, lineHeight: 22 },
  errorBox: { backgroundColor: `${Colors.error}18`, borderRadius: Radius.md, padding: Spacing.md, marginTop: Spacing.md },
  errorText: { fontSize: 13, color: Colors.error },

  footer: { paddingHorizontal: Spacing.xl, paddingBottom: 28, paddingTop: Spacing.sm, backgroundColor: Colors.background, borderTopWidth: 1, borderTopColor: Colors.border, gap: Spacing.sm },
  saveBtn: { backgroundColor: Colors.primary, borderRadius: Radius.md, paddingVertical: 16, alignItems: 'center', ...Shadow.card },
  saveBtnDisabled: { opacity: 0.6 },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  skipBtn: { alignItems: 'center', paddingVertical: 10 },
  skipBtnText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
});
