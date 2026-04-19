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
  LayoutAnimation,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Colors, Radius, Spacing, Typography } from '../constants/theme';
import { api, PetEvent } from '../api/client';
import { AuthStore } from '../store/auth';
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
  { key: 'weight', label: '⚖️ Pesée', types: ['weight'], color: Colors.primary },
  { key: 'sante', label: '💊 Santé', types: ['health_note'], color: Colors.error },
  { key: 'alimentation', label: '🥣 Alim.', types: ['food_serve'], color: Colors.accent },
  { key: 'litiere', label: '🚽 Litière', types: ['litter_clean'], color: Colors.success },
  { key: 'comportement', label: '👁️ Comport.', types: ['behavior'], color: Colors.info },
  { key: 'evenement', label: '📅 Évén.', types: ['custom'], color: Colors.secondary },
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
  const [error, setError] = useState<string | null>(null);
  const [limit, setLimit] = useState(50);

  const loadEvents = useCallback(async () => {
    setError(null);
    try {
      const data = await api.getAllEvents(limit);
      setEvents(data);
    } catch (err) {
      console.warn('[Timeline] load error:', err);
      const isGuest = await AuthStore.isGuestMode();
      if (!isGuest) setError('Impossible de charger les données. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [limit]);

  useFocusEffect(
    useCallback(() => {
      loadEvents();
    }, [loadEvents])
  );

  const handleFilterChange = (key: string) => {
    if (Platform.OS === 'android') {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
    setActiveFilter(key);
  };

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

      {error && (
        <View style={styles.errorBox} testID="error-box">
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity onPress={() => { setError(null); loadEvents(); }} style={styles.retryBtn} testID="retry-btn">
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Timeline</Text>
        <SyncBadge />
      </View>

      {/* Filter pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={true}
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
              onPress={() => handleFilterChange(filter.key)}
              activeOpacity={0.7}
              testID={`filter-${filter.key}`}
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
          testID="timeline-list"
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
          ListFooterComponent={
            events.length === limit ? (
              <TouchableOpacity
                style={styles.loadMoreBtn}
                onPress={() => setLimit((l) => l + 50)}
                activeOpacity={0.7}
              >
                <Text style={styles.loadMoreText}>Charger plus</Text>
              </TouchableOpacity>
            ) : null
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
  loadMoreBtn: {
    alignItems: 'center',
    padding: 16,
    marginTop: 8,
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
});
