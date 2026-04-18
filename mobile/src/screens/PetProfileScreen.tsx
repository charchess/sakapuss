import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Colors, Radius, Spacing, Shadow, Typography } from '../constants/theme';
import { api, PetEvent } from '../api/client';
import { EventCard } from '../components/EventCard';

interface RouteParams {
  petId: string;
  petName: string;
  species: string;
  breed?: string;
  birthDate?: string;
}

interface Props {
  navigation: any;
  route: { params: RouteParams };
}

function speciesEmoji(species: string): string {
  const s = species.toLowerCase();
  if (s === 'cat' || s === 'chat') return '🐱';
  if (s === 'dog' || s === 'chien') return '🐶';
  if (s === 'rabbit' || s === 'lapin') return '🐰';
  if (s === 'bird' || s === 'oiseau') return '🐦';
  if (s === 'hamster') return '🐹';
  return '🐾';
}

function computeAge(birthDate: string): string {
  const born = new Date(birthDate);
  const now = new Date();
  const years = now.getFullYear() - born.getFullYear();
  const months = now.getMonth() - born.getMonth();
  const totalMonths = years * 12 + months;

  if (totalMonths < 1) return 'Moins d\'1 mois';
  if (totalMonths < 12) return `${totalMonths} mois`;
  const y = Math.floor(totalMonths / 12);
  const m = totalMonths % 12;
  if (m === 0) return `${y} an${y > 1 ? 's' : ''}`;
  return `${y} an${y > 1 ? 's' : ''} ${m} mois`;
}

export function PetProfileScreen({ navigation, route }: Props) {
  const { petId, petName, species, breed, birthDate } = route.params;
  const [events, setEvents] = useState<PetEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      setError(null);
      api.getPetEvents(petId)
        .then((data) => { if (active) setEvents(data.slice(0, 20)); })
        .catch(() => { if (active) setError('Impossible de charger les événements.'); })
        .finally(() => { if (active) setLoading(false); });
      return () => { active = false; };
    }, [petId])
  );

  return (
    <View style={styles.root}>
      <StatusBar style="dark" backgroundColor={Colors.background} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>{speciesEmoji(species)}</Text>
          </View>
          <Text style={styles.petName}>{petName}</Text>
          {breed ? <Text style={styles.breed}>{breed}</Text> : null}
          {birthDate ? (
            <View style={styles.agePill}>
              <Text style={styles.ageText}>🎂 {computeAge(birthDate)}</Text>
            </View>
          ) : null}
        </View>

        {/* Events section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Événements récents</Text>

          {loading ? (
            <ActivityIndicator color={Colors.primary} style={{ marginTop: 24 }} />
          ) : error ? (
            <View style={styles.errorBox} testID="error-box">
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : events.length === 0 ? (
            <View style={styles.emptyState} testID="empty-state">
              <Text style={styles.emptyIcon}>📋</Text>
              <Text style={styles.emptyText}>Aucun événement enregistré</Text>
            </View>
          ) : (
            events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))
          )}
        </View>

        {/* Quick log shortcut */}
        <TouchableOpacity
          style={styles.logBtn}
          onPress={() =>
            navigation.navigate('QuickLog', {
              type: 'weight',
              label: 'Pesée',
              icon: '⚖️',
              petId,
              petName,
            })
          }
          activeOpacity={0.8}
        >
          <Text style={styles.logBtnText}>⚖️ Peser {petName}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    paddingBottom: 48,
  },
  hero: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.xl,
    backgroundColor: Colors.surface,
    borderBottomLeftRadius: Radius.xl,
    borderBottomRightRadius: Radius.xl,
    ...Shadow.card,
    marginBottom: Spacing.lg,
  },
  avatarCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: Colors.primaryLight,
    borderWidth: 3,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  avatarEmoji: {
    fontSize: 44,
  },
  petName: {
    ...Typography.h2,
    color: Colors.textPrimary,
  },
  breed: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  agePill: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  ageText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
  section: {
    paddingHorizontal: Spacing.xl,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
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
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
  },
  logBtn: {
    marginHorizontal: Spacing.xl,
    marginTop: Spacing.xl,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 14,
    alignItems: 'center',
    ...Shadow.card,
  },
  logBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
