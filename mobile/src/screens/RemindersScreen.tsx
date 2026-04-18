import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Typography } from '../constants/theme';
import { api, Reminder } from '../api/client';
import { ReminderCard } from '../components/ReminderCard';

function getReminderUrgencySort(r: Reminder): number {
  const due = new Date(r.next_due_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  if (due < today) return 0; // overdue first
  if (due.getTime() === today.getTime()) return 1; // today second
  return 2; // upcoming last
}

export function RemindersScreen() {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReminders = useCallback(async () => {
    setError(null);
    try {
      const data = await api.getPendingReminders();
      const sorted = [...data].sort((a, b) => {
        const ua = getReminderUrgencySort(a);
        const ub = getReminderUrgencySort(b);
        if (ua !== ub) return ua - ub;
        return new Date(a.next_due_date).getTime() - new Date(b.next_due_date).getTime();
      });
      setReminders(sorted);
    } catch (err) {
      console.warn('[Reminders] load error:', err);
      setError('Impossible de charger les données. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadReminders();
    }, [loadReminders])
  );

  const overdueCount = reminders.filter((r) => {
    const due = new Date(r.next_due_date);
    due.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  }).length;

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
          <TouchableOpacity onPress={() => { setError(null); loadReminders(); }} style={styles.retryBtn} testID="retry-btn">
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.title}>Rappels</Text>
        {overdueCount > 0 && (
          <View style={styles.overdueBadge}>
            <Text style={styles.overdueBadgeText}>
              {overdueCount} en retard
            </Text>
          </View>
        )}
      </View>

      {reminders.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>✅</Text>
          <Text style={styles.emptyTitle}>Tout est à jour !</Text>
          <Text style={styles.emptyText}>
            Aucun rappel en attente pour vos animaux.
          </Text>
        </View>
      ) : (
        <FlatList
          data={reminders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ReminderCard reminder={item} />}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadReminders();
              }}
              tintColor={Colors.primary}
            />
          }
          ListHeaderComponent={
            reminders.length > 0 ? (
              <Text style={styles.countLabel}>
                {reminders.length} rappel{reminders.length > 1 ? 's' : ''} en attente
              </Text>
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
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  title: {
    ...Typography.h2,
    marginRight: 10,
  },
  overdueBadge: {
    backgroundColor: `${Colors.error}1A`,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
  },
  overdueBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.error,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: 32,
  },
  countLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    marginBottom: Spacing.sm,
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
  },
  emptyIcon: {
    fontSize: 56,
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
});
