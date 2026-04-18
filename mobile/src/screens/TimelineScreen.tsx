import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Colors, Radius, Spacing, Shadow, Typography } from '../constants/theme';
import { api, PetEvent } from '../api/client';
import { EventCard } from '../components/EventCard';
import { SyncBadge } from '../components/SyncBadge';

interface FilterPill {
  key: string;
  label: string;
  types: string[];
  color: string;
}

const FILTERS: FilterPill[] = [
  { key: 'all', label: 'Tout', types: [], color: Colors.primary },
  { key: 'weight', label: '⚖️ Pesée', types: ['weight'], color: '#6C5CE7' },
  { key: 'sante', label: '💊 Santé', types: ['health_note'], color: '#E17055' },
  { key: 'alimentation', label: '🥣 Alim.', types: ['food_serve'], color: '#FDCB6E' },
  { key: 'litiere', label: '🚽 Litière', types: ['litter_clean'], color: '#00B894' },
  { key: 'comportement', label: '👁️ Comport.', types: ['behavior'], color: '#0984E3' },
  { key: 'evenement', label: '📅 Événement', types: ['custom'], color: '#A29BFE' },
];

interface DayGroup {
  dateLabel: string;
  events: PetEvent[];
}

function groupByDay(events: PetEvent[]): DayGroup[] {
  const groups: Record<string, PetEvent[]> = {};

  for (const event of events) {
    const d = new Date(event.occurred_at);
    const key = d.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    if (!groups[key]) groups[key] = [];
    groups[key].push(event);
  }

  return Object.entries(groups).map(([dateLabel, evts]) => ({
    dateLabel,
    events: evts,
  }));
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function TimelineScreen() {
  const [events, setEvents] = useState<PetEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  const loadEvents = useCallback(async () => {
    try {
      const data = await api.getAllEvents(100);
      setEvents(data);
    } catch (err) {
      console.warn('[Timeline] load error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [loadEvents])
  );

  const filteredEvents = activeFilter === 'all'
    ? events
    : events.filter((e) => {
        const filter = FILTERS.find((f) => f.key === activeFilter);
        return filter ? filter.types.includes(e.type) : true;
      });

  const groups = groupByDay(filteredEvents);

  const renderGroup = ({ item }: { item: DayGroup }) => (
    <View style={styles.group}>
      <Text style={styles.dayLabel}>{capitalize(item.dateLabel)}</Text>
      {item.events.map((event) => (
        <EventCard key={event.id} event={event} showPetName />
      ))}
    </View>
  );

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

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Timeline</Text>
        <SyncBadge />
      </View>

      {/* Filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterBar}
        contentContainerStyle={styles.filterContent}
      >
        {FILTERS.map((filter) => {
          const active = activeFilter === filter.key;
          return (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.pill,
                active && { backgroundColor: filter.color, borderColor: filter.color },
              ]}
              onPress={() => setActiveFilter(filter.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.pillText, active && styles.pillTextActive]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Event list */}
      {groups.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>Aucun événement</Text>
          <Text style={styles.emptyText}>
            {activeFilter !== 'all'
              ? 'Aucun événement pour ce filtre.'
              : 'Commencez par enregistrer des événements depuis le tableau de bord.'}
          </Text>
        </View>
      ) : (
        <FlatList
          data={groups}
          keyExtractor={(item) => item.dateLabel}
          renderItem={renderGroup}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadEvents();
              }}
              tintColor={Colors.primary}
            />
          }
        />
      )}
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
  },
  title: {
    ...Typography.h2,
  },
  filterBar: {
    maxHeight: 52,
    marginBottom: Spacing.sm,
  },
  filterContent: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: 6,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    marginRight: 8,
  },
  pillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  pillTextActive: {
    color: '#fff',
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 32,
  },
  group: {
    marginBottom: Spacing.lg,
  },
  dayLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
    marginBottom: Spacing.sm,
    textTransform: 'capitalize',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    ...Typography.h3,
    marginBottom: 8,
  },
  emptyText: {
    ...Typography.body,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
});
