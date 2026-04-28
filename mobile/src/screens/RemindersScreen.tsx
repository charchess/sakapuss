import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Colors, Spacing, Typography } from '../constants/theme';
import { Reminder, TreatmentDose } from '../api/client';
import { dataService } from '../store/dataService';
import { ReminderCard } from '../components/ReminderCard';
import { TreatmentDoseCard } from '../components/TreatmentDoseCard';

type ListItem =
  | { kind: 'reminder'; data: Reminder; sortKey: number }
  | { kind: 'dose'; data: TreatmentDose; sortKey: number };

function reminderSortKey(r: Reminder): number {
  const due = new Date(r.next_due_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  const urgency = due < today ? 0 : due.getTime() === today.getTime() ? 1 : 2;
  return urgency * 1e13 + due.getTime();
}

function doseSortKey(d: TreatmentDose): number {
  const t = new Date(d.scheduled_at).getTime();
  const isOverdue = t < Date.now();
  return (isOverdue ? 0 : 1) * 1e13 + t;
}

export function RemindersScreen() {
  const [items, setItems] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [reminders, doses] = await Promise.all([
        dataService.getPendingReminders(),
        dataService.getPendingDoses(),
      ]);

      const all: ListItem[] = [
        ...reminders.map((r): ListItem => ({ kind: 'reminder', data: r, sortKey: reminderSortKey(r) })),
        ...doses.map((d): ListItem => ({ kind: 'dose', data: d, sortKey: doseSortKey(d) })),
      ];
      all.sort((a, b) => a.sortKey - b.sortKey);
      setItems(all);
    } catch (err) {
      console.warn('[Reminders] load error:', err);
      setError('Impossible de charger les données. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const overdueCount = items.filter((item) => {
    if (item.kind === 'reminder') {
      const due = new Date(item.data.next_due_date);
      due.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return due < today;
    }
    return new Date(item.data.scheduled_at) < new Date();
  }).length;

  const handleDoseComplete = async (doseId: string, comment?: string) => {
    try {
      const result = await dataService.completeDose(doseId, comment);
      if (result.is_last_dose) {
        Alert.alert(
          'Traitement terminé 🎉',
          `Toutes les doses de "${result.treatment_name}" ont été administrées. Voulez-vous prolonger ?`,
          [
            { text: 'Terminer', style: 'cancel', onPress: load },
            {
              text: 'Prolonger...',
              onPress: () => {
                Alert.prompt(
                  'Prolonger le traitement',
                  'Combien de jours supplémentaires ?',
                  async (days) => {
                    const n = parseInt(days ?? '', 10);
                    if (n > 0) {
                      await dataService.extendTreatment(result.treatment_id, n);
                    }
                    load();
                  },
                  'plain-text',
                  '7',
                  'numeric',
                );
              },
            },
          ]
        );
      } else {
        load();
      }
    } catch (err) {
      console.warn('[Reminders] dose complete error:', err);
    }
  };

  const handleDoseMissed = async (doseId: string, comment?: string) => {
    try {
      const result = await dataService.missDose(doseId, comment);
      if (result.is_last_dose) {
        Alert.alert(
          'Traitement terminé',
          `Dernière dose de "${result.treatment_name}" enregistrée comme ratée. Prolonger ?`,
          [
            { text: 'Terminer', style: 'cancel', onPress: load },
            {
              text: 'Prolonger...',
              onPress: () => {
                Alert.prompt(
                  'Prolonger le traitement',
                  'Combien de jours supplémentaires ?',
                  async (days) => {
                    const n = parseInt(days ?? '', 10);
                    if (n > 0) await dataService.extendTreatment(result.treatment_id, n);
                    load();
                  },
                  'plain-text',
                  '7',
                  'numeric',
                );
              },
            },
          ]
        );
      } else {
        load();
      }
    } catch (err) {
      console.warn('[Reminders] dose missed error:', err);
    }
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
          <TouchableOpacity onPress={() => { setError(null); load(); }} style={styles.retryBtn} testID="retry-btn">
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.header}>
        <Text style={styles.title}>Rappels</Text>
        {overdueCount > 0 && (
          <View style={styles.overdueBadge}>
            <Text style={styles.overdueBadgeText}>{overdueCount} en retard</Text>
          </View>
        )}
      </View>

      {items.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>✅</Text>
          <Text style={styles.emptyTitle}>Tout est à jour !</Text>
          <Text style={styles.emptyText}>Aucun rappel en attente pour vos animaux.</Text>
        </View>
      ) : (
        <FlatList
          testID="reminder-list"
          data={items}
          keyExtractor={(item) => `${item.kind}-${item.kind === 'reminder' ? item.data.id : item.data.id}`}
          renderItem={({ item }) => {
            if (item.kind === 'reminder') {
              return (
                <ReminderCard
                  reminder={item.data}
                  onComplete={async (id, comment) => {
                    try { await dataService.completeReminder(id, comment); load(); }
                    catch (err) { console.warn('[Reminders] complete error:', err); }
                  }}
                  onPostpone={async (id, days) => {
                    try { await dataService.postponeReminder(id, days); load(); }
                    catch (err) { console.warn('[Reminders] postpone error:', err); }
                  }}
                  onMissed={async (id, comment) => {
                    try { await dataService.missReminder(id, comment); load(); }
                    catch (err) { console.warn('[Reminders] missed error:', err); }
                  }}
                  onDelete={async (id) => {
                    try { await dataService.deleteReminder(id); load(); }
                    catch (err: unknown) {
                      const msg = (err as { message?: string })?.message ?? JSON.stringify(err);
                      setError(`Erreur suppression: ${msg}`);
                    }
                  }}
                />
              );
            }
            return (
              <TreatmentDoseCard
                dose={item.data}
                onComplete={handleDoseComplete}
                onMissed={handleDoseMissed}
              />
            );
          }}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); load(); }}
              tintColor={Colors.primary}
            />
          }
          ListHeaderComponent={
            items.length > 0 ? (
              <Text style={styles.countLabel}>
                {items.length} élément{items.length > 1 ? 's' : ''} en attente
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
    justifyContent: 'flex-start',
    paddingTop: Spacing.xxl,
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
