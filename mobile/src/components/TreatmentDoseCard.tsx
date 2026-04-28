import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Radius, Shadow, Spacing } from '../constants/theme';
import { TreatmentDose } from '../api/client';

interface Props {
  dose: TreatmentDose;
  onComplete?: (doseId: string, comment?: string) => void;
  onMissed?: (doseId: string, comment?: string) => void;
}

const MOMENT_ICON: Record<string, string> = {
  morning: '🌅',
  noon: '☀️',
  evening: '🌙',
};

const MOMENT_LABEL: Record<string, string> = {
  morning: 'Matin',
  noon: 'Midi',
  evening: 'Soir',
};

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
  } catch {
    return '';
  }
}

export function TreatmentDoseCard({ dose, onComplete, onMissed }: Props) {
  const [pendingAction, setPendingAction] = useState<'complete' | 'miss' | null>(null);
  const [comment, setComment] = useState('');

  const isOverdue = new Date(dose.scheduled_at) < new Date();

  const handleConfirm = () => {
    if (pendingAction === 'complete') onComplete?.(dose.id, comment || undefined);
    else if (pendingAction === 'miss') onMissed?.(dose.id, comment || undefined);
    setPendingAction(null);
    setComment('');
  };

  const handleCancel = () => {
    setPendingAction(null);
    setComment('');
  };

  const borderColor = isOverdue ? Colors.error : Colors.primary;

  return (
    <View style={[styles.card, { borderLeftColor: borderColor, borderLeftWidth: 4 }]}>
      <View style={styles.header}>
        <Text style={styles.icon}>{MOMENT_ICON[dose.moment] ?? '💊'}</Text>
        <View style={styles.body}>
          <Text style={styles.name}>{dose.treatment_name}</Text>
          <Text style={styles.petName}>{dose.pet_name}</Text>
          <Text style={styles.meta}>
            {MOMENT_LABEL[dose.moment]} · {formatDate(dose.scheduled_at)} {formatTime(dose.scheduled_at)}
          </Text>
        </View>
        <View style={styles.progress}>
          <Text style={styles.progressText}>
            Dose {dose.dose_number}/{dose.total_doses}
          </Text>
          <Text style={styles.progressSub}>
            Jour {dose.day_number}/{dose.total_days}
          </Text>
          {isOverdue && (
            <View style={[styles.badge, { backgroundColor: `${Colors.error}1A` }]}>
              <Text style={[styles.badgeText, { color: Colors.error }]}>En retard</Text>
            </View>
          )}
        </View>
      </View>

      {pendingAction ? (
        <View style={styles.commentBox}>
          <TextInput
            style={styles.commentInput}
            placeholder="Ajouter une note (optionnel)"
            placeholderTextColor={Colors.textMuted}
            value={comment}
            onChangeText={setComment}
            autoFocus
          />
          <View style={styles.confirmRow}>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm} activeOpacity={0.8}>
              <Text style={styles.confirmText}>Confirmer</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel} activeOpacity={0.8}>
              <Text style={styles.cancelText}>Annuler</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <View style={styles.actions}>
          {onComplete && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.doneBtn]}
              onPress={() => setPendingAction('complete')}
              activeOpacity={0.8}
            >
              <Text style={[styles.actionText, { color: Colors.success }]}>✅ Fait</Text>
            </TouchableOpacity>
          )}
          {onMissed && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.missBtn]}
              onPress={() => setPendingAction('miss')}
              activeOpacity={0.8}
            >
              <Text style={[styles.actionText, { color: Colors.error }]}>❌ Raté</Text>
            </TouchableOpacity>
          )}
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
  icon: {
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
  meta: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  progress: {
    alignItems: 'flex-end',
    gap: 4,
    marginLeft: Spacing.sm,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  progressSub: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: Radius.full,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    marginTop: Spacing.sm,
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignItems: 'center',
  },
  doneBtn: {
    backgroundColor: `${Colors.success}14`,
    borderColor: `${Colors.success}40`,
  },
  missBtn: {
    backgroundColor: `${Colors.error}10`,
    borderColor: `${Colors.error}40`,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
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
