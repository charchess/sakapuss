import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Colors, Radius, Shadow } from '../constants/theme';

interface Props {
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
}

export function QuickLogTile({ icon, label, color, onPress }: Props) {
  return (
    <TouchableOpacity
      style={[styles.tile, { backgroundColor: `${color}14` }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={[styles.iconCircle, { backgroundColor: `${color}22` }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={[styles.label, { color }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    margin: 5,
    borderRadius: Radius.lg,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 88,
    ...Shadow.card,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  icon: {
    fontSize: 22,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
});
