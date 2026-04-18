import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Colors, Radius, Spacing, Shadow, Typography } from '../constants/theme';
import { AuthStore, User } from '../store/auth';
import { api, Pet, PetEvent } from '../api/client';
import { flushQueue } from '../api/sync';
import { PetAvatar } from '../components/PetAvatar';
import { QuickLogTile } from '../components/QuickLogTile';
import { EventCard } from '../components/EventCard';
import { SyncBadge } from '../components/SyncBadge';

interface QuickAction {
  key: string;
  icon: string;
  label: string;
  color: string;
  type: string;
}

const QUICK_ACTIONS: QuickAction[] = [
  { key: 'litter', icon: '🚽', label: 'Litière', color: '#00B894', type: 'litter_clean' },
  { key: 'food', icon: '🥣', label: 'Gamelle', color: '#FDCB6E', type: 'food_serve' },
  { key: 'weight', icon: '⚖️', label: 'Pesée', color: '#6C5CE7', type: 'weight' },
  { key: 'medicine', icon: '💊', label: 'Médicament', color: '#E17055', type: 'health_note' },
  { key: 'observation', icon: '👁️', label: 'Observation', color: '#0984E3', type: 'behavior' },
  { key: 'event', icon: '📅', label: 'Événement', color: '#A29BFE', type: 'custom' },
];

interface Props {
  navigation: any;
}

export function DashboardScreen({ navigation }: Props) {
  const [user, setUser] = useState<User | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPetId, setSelectedPetId] = useState<string | null>(null);
  const [recentEvents, setRecentEvents] = useState<PetEvent[]>([]);
  const [remindersCount, setRemindersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedPet = pets.find((p) => p.id === selectedPetId) ?? null;

  const loadData = useCallback(async () => {
    setError(null);
    try {
      const [u, fetchedPets] = await Promise.all([
        AuthStore.getUser(),
        api.getPets(),
      ]);
      setUser(u);
      setPets(fetchedPets);

      const firstPetId = fetchedPets[0]?.id ?? null;
      const targetId = selectedPetId ?? firstPetId;
      setSelectedPetId(targetId);

      const [events, reminders] = await Promise.all([
        targetId
          ? api.getPetEvents(targetId)
          : api.getAllEvents(20),
        api.getPendingReminders(),
      ]);

      setRecentEvents(events.slice(0, 10));
      setRemindersCount(reminders.length);
    } catch (err) {
      console.warn('[Dashboard] loadData error:', err);
      setError('Impossible de charger les données. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedPetId]);

  useFocusEffect(
    useCallback(() => {
      loadData();
      flushQueue();
    }, [loadData])
  );

  const handleSelectPet = async (petId: string) => {
    setSelectedPetId(petId);
    try {
      const events = await api.getPetEvents(petId);
      setRecentEvents(events.slice(0, 10));
    } catch {
      // ignore
    }
  };

  const handleQuickAction = (action: QuickAction) => {
    navigation.navigate('QuickLog', {
      type: action.type,
      label: action.label,
      icon: action.icon,
      petId: selectedPetId,
      petName: selectedPet?.name ?? '',
    });
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const greeting = (): string => {
    const h = new Date().getHours();
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bon après-midi';
    return 'Bonsoir';
  };

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar style="dark" backgroundColor={Colors.background} />

      {error && (
        <View style={styles.errorBox} testID="error-box">
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => { setError(null); loadData(); }} style={styles.retryBtn} testID="retry-btn">
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>
            {greeting()}{user?.display_name ? `, ${user.display_name}` : ''} 👋
          </Text>
          <Text style={styles.subtitle}>Que se passe-t-il aujourd'hui ?</Text>
        </View>
        <SyncBadge />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={Colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* No pets empty state */}
        {pets.length === 0 && !loading && (
          <View style={styles.noPetsBox}>
            <Text style={styles.noPetsIcon}>🐾</Text>
            <Text style={styles.noPetsText}>Aucun animal enregistré</Text>
            <TouchableOpacity
              style={styles.addPetBtn}
              onPress={() => navigation.navigate('AddPet')}
              activeOpacity={0.8}
            >
              <Text style={styles.addPetBtnText}>+ Ajouter un animal</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Pet selector */}
        {pets.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionLabel}>Mes animaux</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('AddPet')}
                style={styles.addPetMini}
                activeOpacity={0.7}
              >
                <Text style={styles.addPetMiniText}>+ Ajouter</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.petStrip}>
              {pets.map((pet) => (
                <TouchableOpacity
                  key={pet.id}
                  onPress={() => handleSelectPet(pet.id)}
                  activeOpacity={0.8}
                >
                  <PetAvatar
                    name={pet.name}
                    species={pet.species}
                    photoUrl={pet.photo_url}
                    selected={selectedPetId === pet.id}
                    size={56}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
            {selectedPet && (
              <TouchableOpacity
                style={styles.profileLink}
                onPress={() =>
                  navigation.navigate('PetProfile', {
                    petId: selectedPet.id,
                    petName: selectedPet.name,
                    species: selectedPet.species,
                    breed: selectedPet.breed,
                    birthDate: selectedPet.birth_date,
                  })
                }
                activeOpacity={0.7}
              >
                <Text style={styles.profileLinkText}>Fiche de {selectedPet.name} ›</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Reminders badge */}
        {remindersCount > 0 && (
          <TouchableOpacity
            style={styles.reminderBanner}
            onPress={() => navigation.navigate('Rappels')}
            activeOpacity={0.8}
          >
            <Text style={styles.reminderBannerIcon}>🔔</Text>
            <Text style={styles.reminderBannerText}>
              {remindersCount} rappel{remindersCount > 1 ? 's' : ''} en attente
            </Text>
            <Text style={styles.reminderBannerArrow}>›</Text>
          </TouchableOpacity>
        )}

        {/* Quick Log grid */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saisie rapide</Text>
          {selectedPet === null && pets.length > 0 && (
            <Text style={styles.selectPetHint}>Sélectionnez un animal ci-dessus</Text>
          )}
          <View style={styles.grid}>
            {QUICK_ACTIONS.map((action) => (
              <QuickLogTile
                key={action.key}
                icon={action.icon}
                label={action.label}
                color={action.color}
                onPress={() => handleQuickAction(action)}
              />
            ))}
          </View>
        </View>

        {/* Recent events */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Activité récente</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Timeline')}>
              <Text style={styles.seeAll}>Tout voir ›</Text>
            </TouchableOpacity>
          </View>
          {recentEvents.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>Aucun événement récent</Text>
            </View>
          ) : (
            recentEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                showPetName={pets.length > 1}
              />
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.background,
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  section: {
    paddingHorizontal: Spacing.xl,
    marginTop: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    ...Typography.h4,
    marginBottom: Spacing.md,
  },
  seeAll: {
    fontSize: 13,
    color: Colors.primary,
    fontWeight: '600',
  },
  petStrip: {
    marginHorizontal: -Spacing.sm,
  },
  reminderBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${Colors.accent}22`,
    borderWidth: 1,
    borderColor: `${Colors.accent}66`,
    borderRadius: Radius.md,
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.md,
    paddingVertical: 12,
    paddingHorizontal: Spacing.lg,
  },
  reminderBannerIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  reminderBannerText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  reminderBannerArrow: {
    fontSize: 20,
    color: Colors.textMuted,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  selectPetHint: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    ...Shadow.card,
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textMuted,
  },
  errorBox: {
    backgroundColor: 'rgba(225,112,85,0.1)',
    borderRadius: 12,
    padding: 16,
    margin: 16,
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
  profileLink: {
    alignSelf: 'flex-end',
    marginTop: 4,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  profileLinkText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '600',
  },
  noPetsBox: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl,
  },
  noPetsIcon: {
    fontSize: 48,
    marginBottom: Spacing.md,
  },
  noPetsText: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },
  addPetBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.xl,
    paddingVertical: 12,
    ...Shadow.card,
  },
  addPetBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addPetMini: {
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  addPetMiniText: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '700',
  },
});
