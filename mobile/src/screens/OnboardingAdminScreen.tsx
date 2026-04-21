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
import { StackScreenProps } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Colors, Radius, Spacing, Shadow, Typography } from '../constants/theme';
import { dataService } from '../store/dataService';
import { OnboardingState } from '../store/onboardingState';
import { HomeStackParamList } from '../navigation/AppNavigator';
import { Pet } from '../api/client';

type Props = StackScreenProps<HomeStackParamList, 'OnboardingAdmin'>;

interface HealthReminder {
  key: string;
  name: string;
  frequency_days: number;
  defaultChecked: boolean;
  testID: string;
  dogsOnly?: boolean;
}

const HEALTH_REMINDERS: HealthReminder[] = [
  { key: 'deworming', name: 'Vermifuge', frequency_days: 90, defaultChecked: true, testID: 'onboarding-health-deworming' },
  { key: 'flea', name: 'Anti-puces', frequency_days: 30, defaultChecked: true, testID: 'onboarding-health-flea' },
  { key: 'vaccine', name: 'Vaccin annuel', frequency_days: 365, defaultChecked: false, testID: 'onboarding-health-vaccine' },
  { key: 'checkup', name: 'Bilan vétérinaire annuel', frequency_days: 365, defaultChecked: false, testID: 'onboarding-health-checkup', dogsOnly: true },
];

const STEPS = ['health', 'weight', 'food'] as const;
type Step = typeof STEPS[number];

const STEP_META: Record<Step, { icon: string; title: string; subtitle: string }> = {
  health: {
    icon: '💊',
    title: 'Rappels santé',
    subtitle: 'Activez les rappels suggérés pour vos animaux',
  },
  weight: {
    icon: '⚖️',
    title: 'Poids initial',
    subtitle: "Notez un poids de départ — vous pourrez suivre l'évolution",
  },
  food: {
    icon: '🥣',
    title: 'Configuration alimentation',
    subtitle: 'Nommez les gamelles que vous souhaitez suivre',
  },
};

function frequencyLabel(days: number): string {
  if (days === 30) return 'Tous les mois';
  if (days === 90) return 'Tous les 3 mois';
  if (days === 365) return 'Tous les ans';
  return `Tous les ${days} jours`;
}

export function OnboardingAdminScreen({ navigation, route }: Props) {
  const fromSettings = route.params?.fromSettings ?? false;

  const [stepIndex, setStepIndex] = useState(0);
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [checked, setChecked] = useState<Record<string, boolean>>(
    Object.fromEntries(HEALTH_REMINDERS.map((r) => [r.key, r.defaultChecked]))
  );
  const [weights, setWeights] = useState<Record<string, string>>({});
  const [bowlName, setBowlName] = useState('Gamelle');

  const currentStep = STEPS[stepIndex];
  const isLastStep = stepIndex === STEPS.length - 1;
  const hasDogs = pets.some((p) => p.species.toLowerCase() === 'chien');
  const visibleReminders = HEALTH_REMINDERS.filter((r) => !r.dogsOnly || hasDogs);

  useEffect(() => {
    dataService
      .getPets()
      .then((p) => setPets(p))
      .catch(() => {})
      .finally(() => setInitializing(false));
  }, []);

  const handleSave = async () => {
    setError(null);
    setLoading(true);
    try {
      if (currentStep === 'health') {
        const calls = visibleReminders
          .filter((r) => checked[r.key])
          .flatMap((r) =>
            pets.map((pet) =>
              dataService.createReminder(pet.id, {
                name: r.name,
                frequency_days: r.frequency_days,
                type: 'health',
              })
            )
          );
        await Promise.all(calls);
        await OnboardingState.markDone('health');
      } else if (currentStep === 'weight') {
        await Promise.all(
          pets
            .filter((pet) => {
              const raw = weights[pet.id];
              const g = parseFloat(raw ?? '');
              return raw && !isNaN(g) && g > 0;
            })
            .map((pet) =>
              dataService.logEvent(pet.id, 'weight', { grams: parseFloat(weights[pet.id]) })
            )
        );
        await OnboardingState.markDone('weight');
      } else {
        const name = bowlName.trim();
        if (name) {
          await dataService.createBowl({ name, location: 'Cuisine', bowl_type: 'food' });
        }
        await OnboardingState.markDone('food');
      }

      advance();
    } catch (err: unknown) {
      setError((err as { message?: string })?.message ?? 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    advance();
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
    if (fromSettings) {
      navigation.goBack();
    } else {
      navigation.navigate('Dashboard');
    }
  };

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
              <View
                style={[
                  styles.segment,
                  i < stepIndex && styles.segmentDone,
                  i === stepIndex && styles.segmentActive,
                ]}
              />
              <Text
                style={[
                  styles.segmentLabel,
                  i === stepIndex && styles.segmentLabelActive,
                ]}
              >
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
        {/* Category header */}
        <View style={styles.header}>
          <Text style={styles.headerIcon}>{meta.icon}</Text>
          <Text style={styles.headerTitle}>{meta.title}</Text>
          <Text style={styles.headerSubtitle}>{meta.subtitle}</Text>
        </View>

        {/* Health step */}
        {currentStep === 'health' && (
          <View testID="onboarding-category-health">
            {visibleReminders.map((reminder) => (
              <TouchableOpacity
                key={reminder.key}
                style={[
                  styles.reminderCard,
                  checked[reminder.key] && styles.reminderCardChecked,
                ]}
                onPress={() =>
                  setChecked((c) => ({ ...c, [reminder.key]: !c[reminder.key] }))
                }
                activeOpacity={0.7}
                testID={reminder.testID}
              >
                <View
                  style={[
                    styles.checkbox,
                    checked[reminder.key] && styles.checkboxChecked,
                  ]}
                >
                  {checked[reminder.key] && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </View>
                <View style={styles.reminderBody}>
                  <Text style={styles.reminderName}>{reminder.name}</Text>
                  <Text style={styles.reminderFreq}>
                    {frequencyLabel(reminder.frequency_days)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Weight step */}
        {currentStep === 'weight' && (
          <View testID="onboarding-category-weight">
            {pets.length === 0 ? (
              <Text style={styles.emptyHint}>Aucun animal dans le foyer.</Text>
            ) : (
              pets.map((pet) => (
                <View key={pet.id} style={styles.weightCard}>
                  <Text style={styles.petName}>{pet.name}</Text>
                  <View style={styles.weightInputRow}>
                    <TextInput
                      style={styles.weightInput}
                      placeholder="?"
                      placeholderTextColor={Colors.textMuted}
                      value={weights[pet.id] ?? ''}
                      onChangeText={(v) =>
                        setWeights((w) => ({ ...w, [pet.id]: v }))
                      }
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

        {/* Food step */}
        {currentStep === 'food' && (
          <View testID="onboarding-category-food">
            <View style={styles.foodCard}>
              <TextInput
                style={styles.foodInput}
                value={bowlName}
                onChangeText={setBowlName}
                placeholder="Nom de la gamelle"
                placeholderTextColor={Colors.textMuted}
                testID="onboarding-food-entry"
              />
            </View>
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
          onPress={handleSkip}
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

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBar: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.background,
  },
  stepLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
  },
  progressRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  segmentWrapper: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  segment: {
    width: '100%',
    height: 4,
    borderRadius: Radius.full,
    backgroundColor: Colors.border,
  },
  segmentActive: {
    backgroundColor: Colors.primary,
  },
  segmentDone: {
    backgroundColor: Colors.secondary,
  },
  segmentLabel: {
    fontSize: 14,
    color: Colors.textMuted,
  },
  segmentLabelActive: {
    color: Colors.primary,
  },
  scroll: {
    padding: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  headerIcon: {
    fontSize: 48,
    marginBottom: Spacing.sm,
  },
  headerTitle: {
    ...Typography.h2,
    marginBottom: Spacing.xs,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  reminderCardChecked: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: Radius.sm,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  checkboxChecked: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  checkmark: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  reminderBody: {
    flex: 1,
  },
  reminderName: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  reminderFreq: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
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
  petName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
  },
  weightInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
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
  weightUnit: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  foodCard: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Shadow.card,
  },
  foodInput: {
    fontSize: 15,
    color: Colors.textPrimary,
    paddingVertical: 4,
  },
  emptyHint: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
  errorBox: {
    backgroundColor: `${Colors.error}18`,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  errorText: {
    fontSize: 13,
    color: Colors.error,
  },
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
  saveBtnDisabled: {
    opacity: 0.6,
  },
  saveBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  skipBtn: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  skipBtnText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
