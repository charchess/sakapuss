import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors, Radius, Shadow, Spacing } from '../constants/theme';
import { Reminder } from '../api/client';

interface Props {
  reminder: Reminder;
  onComplete?: (reminderId: string) => void;
  onPostpone?: (reminderId: string, days: number) => void;
}

type Urgency = 'overdue' | 'today' | 'upcoming';

function getUrgency(nextDueDate: string): Urgency {
  const now = new Date();
  const due = new Date(nextDueDate);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dueDay = new Date(due.getFullYear(), due.getMonth(), due.getDate());

  if (dueDay < today) return 'overdue';
  if (dueDay.getTime() === today.getTime()) return 'today';
  return 'upcoming';
}

function urgencyColor(urgency: Urgency): string {
  switch (urgency) {
    case 'overdue': return Colors.error;
    case 'today': return Colors.accent;
    case 'upcoming': return Colors.textMuted;
  }
}

function urgencyLabel(urgency: Urgency): string {
  switch (urgency) {
    case 'overdue': return 'En retard';
    case 'today': return "Aujourd'hui";
    case 'upcoming': return 'À venir';
  }
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

function reminderTypeIcon(type: string): string {
  const t = type.toLowerCase();
  if (t.includes('vaccine') || t.includes('vaccin')) return '💉';
  if (t.includes('vet') || t.includes('vétér')) return '🏥';
  if (t.includes('medicine') || t.includes('médic')) return '💊';
  if (t.includes('weight') || t.includes('pesée')) return '⚖️';
  if (t.includes('grooming') || t.includes('toilett')) return '✂️';
  return '🔔';
}

export function ReminderCard({ reminder, onComplete, onPostpone }: Props) {
  const urgency = getUrgency(reminder.next_due_date);
  const color = urgencyColor(urgency);
  const showActions = !!(onComplete && onPostpone);

  return (
    <View style={[styles.card, { borderLeftColor: color, borderLeftWidth: 4 }]}>
      <Text style={styles.typeIcon}>{reminderTypeIcon(reminder.type)}</Text>
      <View style={styles.body}>
        <Text style={styles.name}>{reminder.name}</Text>
        <Text style={styles.petName}>{reminder.pet_name}</Text>
        <Text style={styles.date}>{formatDate(reminder.next_due_date)}</Text>
        {showActions && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnDone]}
              onPress={() => onComplete!(reminder.id)}
              activeOpacity={0.8}
            >
              <Text style={styles.actionBtnText}>✅ Fait</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnPostpone]}
              onPress={() => onPostpone!(reminder.id, 7)}
              activeOpacity={0.8}
            >
              <Text style={[styles.actionBtnText, { color: Colors.textSecondary }]}>⏭️ +7j</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      <View style={[styles.badge, { backgroundColor: `${color}1A` }]}>
        <Text style={[styles.badgeText, { color }]}>{urgencyLabel(urgency)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginVertical: 4,
    ...Shadow.card,
  },
  typeIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  body: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  petName: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: '500',
    marginTop: 1,
  },
  date: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
    marginLeft: Spacing.sm,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
    gap: 8,
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  actionBtnDone: {
    backgroundColor: `${Colors.success}14`,
    borderColor: `${Colors.success}40`,
  },
  actionBtnPostpone: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.border,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.success,
  },
});
