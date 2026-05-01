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
  Switch,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { StackScreenProps } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Colors, Radius, Spacing, Shadow, Typography } from '../constants/theme';
import { dataService } from '../store/dataService';
import { Resource, Bowl, FoodBag, FoodProduct } from '../api/client';
import { HomeStackParamList } from '../navigation/AppNavigator';

type Props = StackScreenProps<HomeStackParamList, 'QuickLog'>;

const LITTER_NOTES = ['RAS', 'Sang', 'Diarrhée', 'Constipation', 'Vomi'];
const BEHAVIOR_QUICK = ['Vomissement', 'Perte appétit', 'Léthargie', 'Grattage', 'Agitation'];

const FREQ_PRESETS: { label: string; days: number | null }[] = [
  { label: '2×/j', days: 0.5 },
  { label: '1×/j', days: 1 },
  { label: 'Hebdo', days: 7 },
  { label: '2 sem', days: 14 },
  { label: 'Mensuel', days: 30 },
  { label: '3 mois', days: 90 },
  { label: '6 mois', days: 180 },
  { label: '1 an', days: 365 },
  { label: 'Perso', days: null },
];

const DOSE_UNITS = ['comprimé', 'ml', 'pipette', 'spot-on', 'sachet', 'µg'];

const KNOWN_MEDS: Record<string, number> = {
  frontline: 30,
  advocate: 30,
  advantage: 30,
  stronghold: 30,
  milbemax: 90,
  vermifuge: 90,
  drontal: 90,
  profender: 90,
  bravecto: 90,
  nexgard: 30,
  vaccin: 365,
  vaccination: 365,
  primovaccination: 365,
  rappel: 365,
};

function detectMedFrequency(name: string): number | null {
  const lower = name.toLowerCase();
  for (const [key, days] of Object.entries(KNOWN_MEDS)) {
    if (lower.includes(key)) return days;
  }
  return null;
}

function formatDate(d: Date): string {
  return d.toISOString().split('T')[0];
}

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

  // Bag/food selection (food_serve)
  const [openedBags, setOpenedBags] = useState<FoodBag[]>([]);
  const [stockedBags, setStockedBags] = useState<FoodBag[]>([]);
  const [selectedBagId, setSelectedBagId] = useState<string | null>(null);
  const [foodProducts, setFoodProducts] = useState<FoodProduct[]>([]);
  const [bagServings, setBagServings] = useState<Record<string, number>>({});
  const [openingBag, setOpeningBag] = useState(false);

  // Weight fields
  const [grams, setGrams] = useState('');
  const [weightNote, setWeightNote] = useState('');

  // Health note fields
  const [product, setProduct] = useState('');
  const [doseAmount, setDoseAmount] = useState('');
  const [doseUnit, setDoseUnit] = useState('comprimé');
  const [healthDate, setHealthDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [createReminder, setCreateReminder] = useState(false);
  const [reminderFreq, setReminderFreq] = useState<number | null>(null);
  const [detectedFreq, setDetectedFreq] = useState<number | null>(null);
  const [freqPresetLabel, setFreqPresetLabel] = useState<string | null>(null);
  const [customFreqText, setCustomFreqText] = useState('');
  // Treatment (finite dose course)
  const [treatmentType, setTreatmentType] = useState<'recurring' | 'treatment'>('recurring');
  const [dosesPerDay, setDosesPerDay] = useState<1 | 2 | 3>(1);
  const [treatmentDays, setTreatmentDays] = useState('');
  const [momentMorning, setMomentMorning] = useState('08:00');
  const [momentNoon, setMomentNoon] = useState('13:00');
  const [momentEvening, setMomentEvening] = useState('20:00');

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
      Promise.all([
        dataService.getBowls(),
        dataService.getFoodBags(),
        dataService.getFoodProducts(),
        dataService.getAllEvents(500),
      ])
        .then(([bowlsData, bagsData, productsData, events]) => {
          const food = bowlsData.filter((b) => b.bowl_type === 'food');
          setBowls(food);
          if (food.length > 0) {
            setSelectedBowl(food[0].id);
            if (food[0].capacity_g) setAmount(String(food[0].capacity_g));
          }
          setFoodProducts(productsData);
          const opened = bagsData.filter((b) => b.status === 'opened');
          const stocked = bagsData.filter((b) => b.status === 'stocked');
          setOpenedBags(opened);
          setStockedBags(stocked);
          if (opened.length > 0) setSelectedBagId(opened[0].id);
          const servMap: Record<string, number> = {};
          events
            .filter((e) => e.type === 'food_serve' && e.payload.bag_id && e.payload.amount_grams)
            .forEach((e) => {
              const bid = e.payload.bag_id as string;
              servMap[bid] = (servMap[bid] ?? 0) + ((e.payload.amount_grams as number) || 0);
            });
          setBagServings(servMap);
        })
        .catch(() => {})
        .finally(() => setLoadingResources(false));
    }
  }, [type]);

  const buildPayload = (): Record<string, unknown> => {
    switch (type) {
      case 'weight':
        return { grams: parseFloat(grams) || 0, note: weightNote.trim() || undefined };
      case 'health_note': {
        const doseStr = doseAmount.trim() ? `${doseAmount.trim()} ${doseUnit}` : undefined;
        return { product: product.trim(), dose: doseStr, date: formatDate(healthDate) };
      }
      case 'behavior':
        return { note: (quickBehavior || note).trim() };
      case 'custom':
        return { note: note.trim() };
      case 'food_serve':
        return { bowl_id: selectedBowl, bag_id: selectedBagId ?? undefined, amount_grams: parseFloat(amount) || undefined };
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
        if (createReminder && treatmentType === 'treatment') {
          const days = parseInt(treatmentDays, 10);
          if (!treatmentDays.trim() || isNaN(days) || days < 1) return 'Veuillez saisir la durée du traitement (en jours).';
        }
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
          bag_id: selectedBagId ?? undefined,
        });
      }
      if (petId) {
        await dataService.logEvent(petId, type, buildPayload());
        if (type === 'health_note' && createReminder && petId) {
          if (treatmentType === 'treatment') {
            const days = parseInt(treatmentDays, 10);
            if (days > 0) {
              const startDate = formatDate(healthDate);
              await dataService.createTreatment(petId, {
                name: product.trim(),
                doses_per_day: dosesPerDay,
                start_date: startDate,
                total_days: days,
                moment_morning: dosesPerDay >= 1 ? momentMorning : undefined,
                moment_noon: dosesPerDay >= 3 ? momentNoon : undefined,
                moment_evening: dosesPerDay >= 2 ? momentEvening : undefined,
              });
            }
          } else {
            const freq = reminderFreq ?? detectedFreq ?? 30;
            await dataService.createReminder(petId, {
              name: product.trim(),
              frequency_days: freq,
              type: 'health',
            });
          }
        }
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

  const handleOpenBag = async (bagId: string) => {
    setOpeningBag(true);
    try {
      await dataService.openFoodBag(bagId);
      const bagsData = await dataService.getFoodBags();
      const opened = bagsData.filter((b) => b.status === 'opened');
      const stocked = bagsData.filter((b) => b.status === 'stocked');
      setOpenedBags(opened);
      setStockedBags(stocked);
      setSelectedBagId(bagId);
    } catch {
      setError("Impossible d'ouvrir le sac.");
    } finally {
      setOpeningBag(false);
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
              onPress={() => { setSelectedBowl(b.id); if (b.capacity_g) setAmount(String(b.capacity_g)); }}
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
        <Text style={styles.fieldLabel}>Quel aliment ?</Text>
        {openingBag ? (
          <ActivityIndicator color={Colors.primary} style={{ marginVertical: 12 }} />
        ) : openedBags.length === 0 && stockedBags.length === 0 ? (
          <Text style={styles.hintSub}>Aucun sac — ajoutez-en dans Alimentation</Text>
        ) : openedBags.length === 0 ? (
          <>
            <Text style={styles.hintSub}>Aucun sac ouvert — appuyez pour ouvrir :</Text>
            {stockedBags.map((bag) => {
              const p = foodProducts.find((fp) => fp.id === bag.product_id);
              return (
                <TouchableOpacity
                  key={bag.id}
                  style={styles.resourceCard}
                  onPress={() => handleOpenBag(bag.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.resourceCardIcon}>📦</Text>
                  <View style={styles.resourceCardInfo}>
                    <Text style={styles.resourceName}>{p ? `${p.brand} ${p.name}` : 'Sac'}</Text>
                    <Text style={styles.resourceSub}>{(bag.weight_g / 1000).toFixed(1)} kg · Ouvrir →</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        ) : (
          openedBags.map((bag) => {
            const p = foodProducts.find((fp) => fp.id === bag.product_id);
            return (
              <TouchableOpacity
                key={bag.id}
                style={[styles.resourceCard, selectedBagId === bag.id && styles.resourceCardActive]}
                onPress={() => setSelectedBagId(bag.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.resourceCardIcon}>🍽️</Text>
                <View style={styles.resourceCardInfo}>
                  <Text style={[styles.resourceName, selectedBagId === bag.id && styles.resourceNameActive]}>
                    {p ? `${p.brand} ${p.name}` : 'Sac'}
                  </Text>
                  <Text style={styles.resourceSub}>
                    {(() => {
                      const consumed = bagServings[bag.id] ?? 0;
                      const remaining = Math.max(0, bag.weight_g - consumed);
                      const pct = Math.round((remaining / bag.weight_g) * 100);
                      return consumed > 0
                        ? `~${(remaining / 1000).toFixed(1)} kg restant (${pct}%)`
                        : `${(bag.weight_g / 1000).toFixed(1)} kg · Ouvert`;
                    })()}
                  </Text>
                </View>
                {selectedBagId === bag.id && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            );
          })
        )}
      </View>

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

  const handleProductChange = (text: string) => {
    setProduct(text);
    const freq = detectMedFrequency(text);
    setDetectedFreq(freq);
    if (freq !== null) {
      setCreateReminder(true);
      setReminderFreq(freq);
      const preset = FREQ_PRESETS.find((p) => p.days === freq);
      setFreqPresetLabel(preset?.label ?? 'Perso');
      if (!preset) setCustomFreqText(String(freq));
    }
  };

  const selectFreqPreset = (label: string, days: number | null) => {
    setFreqPresetLabel(label);
    if (days !== null) {
      setReminderFreq(days);
    } else {
      setReminderFreq(customFreqText ? parseFloat(customFreqText) : null);
    }
  };

  const freqLabel = (days: number) => {
    if (days < 1) return `${Math.round(days * 24)}×/j`;
    if (days === 1) return 'chaque jour';
    if (days === 7) return 'chaque semaine';
    if (days === 14) return 'toutes les 2 sem';
    if (days === 30) return 'chaque mois';
    if (days === 90) return 'tous les 3 mois';
    if (days === 180) return 'tous les 6 mois';
    if (days === 365) return 'chaque année';
    return `tous les ${days}j`;
  };

  const renderHealthFields = () => (
    <>
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Médicament / Produit</Text>
        <TextInput
          testID="medicine-name-input"
          style={styles.input}
          placeholder="ex: Frontline, Milbemax, Advocate..."
          placeholderTextColor={Colors.textMuted}
          value={product}
          onChangeText={handleProductChange}
        />
        {detectedFreq !== null && (
          <Text style={styles.medHint}>
            💡 {product.split(' ')[0]} détecté — rappel suggéré {freqLabel(detectedFreq)}
          </Text>
        )}
      </View>
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Dose (optionnel)</Text>
        <View style={styles.doseRow}>
          <TextInput
            style={[styles.input, styles.doseInput]}
            placeholder="0.5"
            placeholderTextColor={Colors.textMuted}
            keyboardType="decimal-pad"
            value={doseAmount}
            onChangeText={setDoseAmount}
          />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.unitScroll} contentContainerStyle={styles.unitScrollContent}>
            {DOSE_UNITS.map((u) => (
              <TouchableOpacity
                key={u}
                style={[styles.pill, doseUnit === u && styles.pillActive]}
                onPress={() => setDoseUnit(u)}
                activeOpacity={0.7}
              >
                <Text style={[styles.pillText, doseUnit === u && styles.pillTextActive]}>{u}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
      <View style={styles.field}>
        <Text style={styles.fieldLabel}>Date de prise</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.dateButtonText}>📅 {formatDate(healthDate)}</Text>
        </TouchableOpacity>
        {showDatePicker && (
          <DateTimePicker
            value={healthDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            maximumDate={new Date()}
            onChange={(_, date) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (date) setHealthDate(date);
            }}
          />
        )}
      </View>
      <View style={[styles.field, styles.reminderRow]}>
        <Text style={styles.fieldLabel}>Créer un rappel</Text>
        <Switch
          testID="reminder-create-switch"
          value={createReminder}
          onValueChange={(v) => {
            setCreateReminder(v);
            if (v && reminderFreq === null) {
              setReminderFreq(detectedFreq ?? 30);
              const preset = FREQ_PRESETS.find((p) => p.days === (detectedFreq ?? 30));
              setFreqPresetLabel(preset?.label ?? 'Perso');
            }
          }}
          trackColor={{ false: Colors.border, true: Colors.primary }}
          thumbColor="#fff"
        />
      </View>
      {createReminder && (
        <>
          {/* Type selector */}
          <View style={styles.field}>
            <View style={styles.pillRow}>
              {(['recurring', 'treatment'] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.pill, treatmentType === t && styles.pillActive]}
                  onPress={() => setTreatmentType(t)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.pillText, treatmentType === t && styles.pillTextActive]}>
                    {t === 'recurring' ? '🔁 Récurrent' : '💊 Traitement'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {treatmentType === 'recurring' ? (
            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Fréquence du rappel</Text>
              <View style={styles.pillRow}>
                {FREQ_PRESETS.map((p) => (
                  <TouchableOpacity
                    key={p.label}
                    style={[styles.pill, freqPresetLabel === p.label && styles.pillActive]}
                    onPress={() => selectFreqPreset(p.label, p.days)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.pillText, freqPresetLabel === p.label && styles.pillTextActive]}>{p.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {freqPresetLabel === 'Perso' && (
                <View style={styles.customFreqRow}>
                  <TextInput
                    style={[styles.input, styles.customFreqInput]}
                    placeholder="ex: 21"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="decimal-pad"
                    value={customFreqText}
                    onChangeText={(t) => { setCustomFreqText(t); setReminderFreq(parseFloat(t) || null); }}
                  />
                  <Text style={styles.customFreqUnit}>jours</Text>
                </View>
              )}
              {reminderFreq !== null && freqPresetLabel !== 'Perso' && (
                <Text style={styles.medHint}>→ Prochain rappel {freqLabel(reminderFreq)} après la prise</Text>
              )}
            </View>
          ) : (
            <>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Prises par jour</Text>
                <View style={styles.pillRow}>
                  {([1, 2, 3] as const).map((n) => (
                    <TouchableOpacity
                      key={n}
                      style={[styles.pill, dosesPerDay === n && styles.pillActive]}
                      onPress={() => setDosesPerDay(n)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.pillText, dosesPerDay === n && styles.pillTextActive]}>
                        {n === 1 ? '1×/j' : n === 2 ? '2×/j' : '3×/j'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Durée (jours)</Text>
                <View style={styles.customFreqRow}>
                  <TextInput
                    style={[styles.input, styles.customFreqInput]}
                    placeholder="ex: 14"
                    placeholderTextColor={Colors.textMuted}
                    keyboardType="number-pad"
                    value={treatmentDays}
                    onChangeText={setTreatmentDays}
                  />
                  <Text style={styles.customFreqUnit}>jours</Text>
                </View>
                {treatmentDays && parseInt(treatmentDays, 10) > 0 && (
                  <Text style={styles.medHint}>
                    → {parseInt(treatmentDays, 10) * dosesPerDay} doses au total
                  </Text>
                )}
              </View>
              <View style={styles.field}>
                <Text style={styles.fieldLabel}>Horaires</Text>
                <View style={styles.momentRow}>
                  <View style={styles.momentItem}>
                    <Text style={styles.momentLabel}>🌅 Matin</Text>
                    <TextInput
                      style={styles.momentInput}
                      value={momentMorning}
                      onChangeText={setMomentMorning}
                      placeholder="08:00"
                      placeholderTextColor={Colors.textMuted}
                    />
                  </View>
                  {dosesPerDay >= 3 && (
                    <View style={styles.momentItem}>
                      <Text style={styles.momentLabel}>☀️ Midi</Text>
                      <TextInput
                        style={styles.momentInput}
                        value={momentNoon}
                        onChangeText={setMomentNoon}
                        placeholder="13:00"
                        placeholderTextColor={Colors.textMuted}
                      />
                    </View>
                  )}
                  {dosesPerDay >= 2 && (
                    <View style={styles.momentItem}>
                      <Text style={styles.momentLabel}>🌙 Soir</Text>
                      <TextInput
                        style={styles.momentInput}
                        value={momentEvening}
                        onChangeText={setMomentEvening}
                        placeholder="20:00"
                        placeholderTextColor={Colors.textMuted}
                      />
                    </View>
                  )}
                </View>
              </View>
            </>
          )}
        </>
      )}
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

      </ScrollView>

      <View style={styles.footer}>
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
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  scroll: { padding: Spacing.xl, paddingBottom: Spacing.md },
  footer: { paddingHorizontal: Spacing.xl, paddingBottom: 24, paddingTop: Spacing.sm, backgroundColor: Colors.background },
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
  hintSub: { fontSize: 12, color: Colors.textMuted, marginBottom: Spacing.sm, fontStyle: 'italic' },
  medHint: { fontSize: 12, color: Colors.primary, marginTop: 6, fontStyle: 'italic' },
  dateButton: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.md,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  dateButtonText: { fontSize: 15, color: Colors.textPrimary },
  reminderRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: Spacing.lg },
  doseRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  doseInput: { width: 80 },
  unitScroll: { flex: 1 },
  unitScrollContent: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  customFreqRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: Spacing.sm },
  customFreqInput: { width: 100 },
  customFreqUnit: { fontSize: 14, color: Colors.textSecondary },
  momentRow: { flexDirection: 'row' as const, gap: 8 },
  momentItem: { flex: 1 },
  momentLabel: { fontSize: 12, fontWeight: '600' as const, color: Colors.textSecondary, marginBottom: 4 },
  momentInput: { borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.sm, padding: 8, fontSize: 13, color: Colors.textPrimary, textAlign: 'center' as const },
  errorBox: {
    backgroundColor: 'rgba(225,112,85,0.1)',
    borderRadius: 12,
    padding: 16,
    marginBottom: Spacing.md,
  },
  errorText: { color: '#E17055', fontSize: 14 },
});
