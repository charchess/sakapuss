import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View } from 'react-native';
import { Radius, Shadow } from '../constants/theme';

interface Props {
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
  testID?: string;
}

export function QuickLogTile({ icon, label, color, onPress, testID }: Props) {
  return (
    <TouchableOpacity
      style={[styles.tile, { backgroundColor: `${color}14` }]}
      onPress={onPress}
      activeOpacity={0.7}
      testID={testID}
    >
      <View style={[styles.iconCircle, { backgroundColor: `${color}22` }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={[styles.label, { color }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tile: {
    width: '31%',
    margin: '1.16%',
    borderRadius: Radius.lg,
    paddingVertical: 16,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 90,
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
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
});
