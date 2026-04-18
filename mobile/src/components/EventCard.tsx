import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius, Shadow, Spacing } from '../constants/theme';
import { PetEvent } from '../api/client';

interface Props {
  event: PetEvent;
  showPetName?: boolean;
}

function eventIcon(type: string): string {
  switch (type) {
    case 'litter_clean': return '🚽';
    case 'food_serve': return '🥣';
    case 'weight': return '⚖️';
    case 'health_note': return '💊';
    case 'behavior': return '👁️';
    case 'custom': return '📅';
    default: return '📋';
  }
}

function eventLabel(type: string): string {
  switch (type) {
    case 'litter_clean': return 'Litière nettoyée';
    case 'food_serve': return 'Gamelle servie';
    case 'weight': return 'Pesée';
    case 'health_note': return 'Médicament';
    case 'behavior': return 'Observation';
    case 'custom': return 'Événement';
    default: return type;
  }
}

function eventColor(type: string): string {
  switch (type) {
    case 'litter_clean': return '#00B894';
    case 'food_serve': return '#FDCB6E';
    case 'weight': return '#6C5CE7';
    case 'health_note': return '#E17055';
    case 'behavior': return '#0984E3';
    case 'custom': return '#A29BFE';
    default: return '#636E72';
  }
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function payloadSummary(type: string, payload: Record<string, unknown>): string {
  switch (type) {
    case 'weight':
      return payload.grams ? `${payload.grams} g${payload.note ? ` — ${payload.note}` : ''}` : '';
    case 'health_note':
      return [payload.product, payload.dose].filter(Boolean).join(' · ');
    case 'behavior':
      return (payload.note as string) ?? '';
    case 'food_serve':
      return payload.amount_grams ? `${payload.amount_grams} g` : '';
    case 'custom':
      return (payload.note as string) ?? '';
    default:
      return '';
  }
}

export function EventCard({ event, showPetName = false }: Props) {
  const color = eventColor(event.type);
  const summary = payloadSummary(event.type, event.payload);

  return (
    <View style={styles.card}>
      <View style={[styles.iconBox, { backgroundColor: `${color}18` }]}>
        <Text style={styles.icon}>{eventIcon(event.type)}</Text>
      </View>
      <View style={styles.body}>
        <View style={styles.row}>
          <Text style={styles.label}>{eventLabel(event.type)}</Text>
          <Text style={styles.time}>{formatTime(event.occurred_at)}</Text>
        </View>
        {showPetName && event.pet_name && (
          <Text style={styles.petName}>{event.pet_name}</Text>
        )}
        {summary ? <Text style={styles.summary} numberOfLines={2}>{summary}</Text> : null}
      </View>
      <View style={[styles.dot, { backgroundColor: color }]} />
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
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  icon: {
    fontSize: 20,
  },
  body: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  time: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  petName: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '600',
    marginTop: 1,
  },
  summary: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: Spacing.sm,
  },
});
