import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Colors, Radius, Shadow, Spacing } from '../constants/theme';
import { Reminder } from '../api/client';

interface Props {
  reminder: Reminder;
  onComplete?: (reminderId: string, comment?: string) => void;
  onPostpone?: (reminderId: string, days: number) => void;
  onMissed?: (reminderId: string, comment?: string) => void;
  onDelete?: (reminderId: string) => void;
}

type Urgency = 'overdue' | 'today' | 'upcoming';

const POSTPONE_OPTIONS = [
  { label: '1j', days: 1 },
  { label: '2j', days: 2 },
  { label: '3j', days: 3 },
  { label: '1 sem', days: 7 },
  { label: '2 sem', days: 14 },
  { label: '1 mois', days: 30 },
];

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
  if (t.includes('medicine') || t.includes('médic') || t === 'health') return '💊';
  if (t.includes('weight') || t.includes('pesée')) return '⚖️';
  if (t.includes('grooming') || t.includes('toilett')) return '✂️';
  return '🔔';
}

export function ReminderCard({ reminder, onComplete, onPostpone, onMissed, onDelete }: Props) {
  const [showPostpone, setShowPostpone] = useState(false);
  const [pendingAction, setPendingAction] = useState<'complete' | 'miss' | null>(null);
  const [comment, setComment] = useState('');
  const urgency = getUrgency(reminder.next_due_date);
  const color = urgencyColor(urgency);

  const handleConfirm = () => {
    if (pendingAction === 'complete') onComplete?.(reminder.id, comment || undefined);
    else if (pendingAction === 'miss') onMissed?.(reminder.id, comment || undefined);
    setPendingAction(null);
    setComment('');
  };

  const handleCancelAction = () => {
    setPendingAction(null);
    setComment('');
  };

  const handleDelete = () => {
    Alert.alert(
      'Supprimer ce rappel',
      `Supprimer "${reminder.name}" définitivement ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: 'Supprimer', style: 'destructive', onPress: () => onDelete?.(reminder.id) },
      ]
    );
  };

  return (
    <View style={[styles.card, { borderLeftColor: color, borderLeftWidth: 4 }]}>
      {/* Header row */}
      <View style={styles.header}>
        <Text style={styles.typeIcon}>{reminderTypeIcon(reminder.type)}</Text>
        <View style={styles.body}>
          <Text style={styles.name}>{reminder.name}</Text>
          <Text style={styles.petName}>{reminder.pet_name}</Text>
          <Text style={styles.date}>{formatDate(reminder.next_due_date)}</Text>
        </View>
        <View style={styles.rightColumn}>
          <View style={[styles.badge, { backgroundColor: `${color}1A` }]}>
            <Text style={[styles.badgeText, { color }]}>{urgencyLabel(urgency)}</Text>
          </View>
          {onDelete && (
            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} activeOpacity={0.7} testID={`reminder-delete-${reminder.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`}>
              <Text style={styles.deleteBtnText}>🗑️</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Inline comment + confirm after action tap */}
      {pendingAction && (
        <View style={styles.commentBox}>
          <TextInput
            testID="reminder-comment-input"
            style={styles.commentInput}
            placeholder="Ajouter une note (optionnel)"
            placeholderTextColor={Colors.textMuted}
            value={comment}
            onChangeText={setComment}
            autoFocus
          />
          <View style={styles.confirmRow}>
            <TouchableOpacity testID="reminder-confirm-btn" style={styles.confirmBtn} onPress={handleConfirm} activeOpacity={0.8}>
              <Text style={styles.confirmText}>Confirmer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancelAction} activeOpacity={0.8}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Action buttons */}
      {!pendingAction && (onComplete || onPostpone || onMissed) && (
        <View style={styles.actions}>
          {onComplete && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnDone]}
              onPress={() => setPendingAction('complete')}
              activeOpacity={0.8}
              testID={`reminder-complete-${reminder.name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase()}`}
            >
              <Text style={[styles.actionBtnText, { color: Colors.success }]}>✅ Fait</Text>
            </TouchableOpacity>
          )}
          {onPostpone && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnPostpone, showPostpone && styles.actionBtnActive]}
              onPress={() => setShowPostpone((v) => !v)}
              activeOpacity={0.8}
              testID="reminder-action-postpone"
            >
              <Text style={[styles.actionBtnText, { color: Colors.primary }]}>⏭️ Reporter</Text>
            </TouchableOpacity>
          )}
          {onMissed && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnMissed]}
              onPress={() => setPendingAction('miss')}
              activeOpacity={0.8}
              testID="reminder-action-missed"
            >
              <Text style={[styles.actionBtnText, { color: Colors.error }]}>❌ Manqué</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Postpone picker */}
      {showPostpone && onPostpone && (
        <View style={styles.postponePicker}>
          <Text style={styles.postponeLabel}>Reporter de :</Text>
          <View style={styles.postponeOptions}>
            {POSTPONE_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.days}
                style={styles.postponePill}
                onPress={() => { onPostpone(reminder.id, opt.days); setShowPostpone(false); }}
                activeOpacity={0.7}
              >
                <Text style={styles.postponePillText}>{opt.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginVertical: 4,
    ...Shadow.card,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  typeIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
    marginTop: 2,
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
  rightColumn: {
    alignItems: 'flex-end',
    gap: 6,
    marginLeft: Spacing.sm,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.full,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  deleteBtn: {
    padding: 2,
  },
  deleteBtnText: {
    fontSize: 15,
  },
  actions: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
    gap: 6,
    flexWrap: 'wrap',
  },
  actionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
  },
  actionBtnDone: {
    backgroundColor: `${Colors.success}14`,
    borderColor: `${Colors.success}40`,
  },
  actionBtnPostpone: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primaryBorder,
  },
  actionBtnActive: {
    backgroundColor: `${Colors.primary}22`,
    borderColor: Colors.primary,
  },
  actionBtnMissed: {
    backgroundColor: `${Colors.error}10`,
    borderColor: `${Colors.error}40`,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  postponePicker: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  postponeLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  postponeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  postponePill: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: Radius.full,
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primaryBorder,
  },
  postponePillText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.primary,
  },
  commentBox: {
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    backgroundColor: Colors.background,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  commentInput: {
    fontSize: 13,
    color: Colors.textPrimary,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    marginBottom: 8,
  },
  confirmRow: {
    flexDirection: 'row',
    gap: 8,
  },
  confirmBtn: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    alignItems: 'center',
  },
  confirmText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: Colors.background,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
});
