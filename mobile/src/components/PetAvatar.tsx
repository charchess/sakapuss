import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { Colors, Radius } from '../constants/theme';
import { speciesEmoji } from '../utils/petUtils';

interface Props {
  name: string;
  species: string;
  photoUrl?: string;
  size?: number;
  selected?: boolean;
}

export function PetAvatar({ name, species, photoUrl, size = 56, selected = false }: Props) {
  const containerStyle = [
    styles.container,
    {
      width: size,
      height: size,
      borderRadius: size / 2,
    },
    selected && styles.selected,
  ];

  return (
    <View style={styles.wrapper}>
      <View style={containerStyle}>
        {photoUrl ? (
          <Image
            source={{ uri: photoUrl }}
            style={{ width: size, height: size, borderRadius: size / 2 }}
          />
        ) : (
          <Text style={{ fontSize: size * 0.5 }}>{speciesEmoji(species)}</Text>
        )}
      </View>
      <Text style={[styles.name, selected && styles.nameSelected]} numberOfLines={1}>
        {name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    marginHorizontal: 6,
    width: 68,
  },
  container: {
    backgroundColor: Colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMid,
  },
  name: {
    marginTop: 4,
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  nameSelected: {
    color: Colors.primary,
    fontWeight: '700',
  },
});
