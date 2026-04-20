import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Colors, Radius, Spacing, Shadow, Typography } from '../constants/theme';
import { dataService } from '../store/dataService';

interface FoyerNavigationProp {
  navigate: (screen: string) => void;
}

interface Props {
  navigation: FoyerNavigationProp;
}

export function FoyerScreen({ navigation }: Props) {
  const [litièresCount, setLitièresCount] = useState<number | null>(null);
  const [bowlsCount, setBowlsCount] = useState<number | null>(null);
  const [productsCount, setProductsCount] = useState<number | null>(null);
  const [openedBagsCount, setOpenedBagsCount] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      Promise.all([
        dataService.getResources('litter'),
        dataService.getBowls(),
        dataService.getFoodProducts(),
        dataService.getFoodBags('opened'),
      ])
        .then(([litières, bowls, products, bags]) => {
          setLitièresCount(litières.filter((r) => r.enabled).length);
          setBowlsCount(bowls.length);
          setProductsCount(products.length);
          setOpenedBagsCount(bags.length);
        })
        .catch(() => {});
    }, [])
  );

  const tiles = [
    {
      icon: '🚽',
      title: 'Litières',
      subtitle: litièresCount !== null ? `${litièresCount} configurée${litièresCount !== 1 ? 's' : ''}` : '—',
      color: Colors.accent,
      screen: 'Litières',
    },
    {
      icon: '🥣',
      title: 'Gamelles',
      subtitle: bowlsCount !== null ? `${bowlsCount} configurée${bowlsCount !== 1 ? 's' : ''}` : '—',
      color: Colors.secondary,
      screen: 'Gamelles',
    },
    {
      icon: '🍽️',
      title: 'Alimentation',
      subtitle: openedBagsCount !== null
        ? `${openedBagsCount} sac${openedBagsCount !== 1 ? 's' : ''} ouvert${openedBagsCount !== 1 ? 's' : ''} · ${productsCount ?? 0} produit${(productsCount ?? 0) !== 1 ? 's' : ''}`
        : '—',
      color: Colors.success,
      screen: 'Alimentation',
    },
  ];

  return (
    <View style={styles.root}>
      <StatusBar style="dark" backgroundColor={Colors.background} />
      <View style={styles.header}>
        <Text style={styles.title}>Foyer 🏡</Text>
        <Text style={styles.subtitle}>Configurez vos équipements</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scroll}>
        {tiles.map((tile) => (
          <TouchableOpacity
            key={tile.screen}
            style={styles.tile}
            onPress={() => navigation.navigate(tile.screen)}
            activeOpacity={0.8}
            testID={`foyer-tile-${tile.screen.toLowerCase().replace(/é/g, 'e').replace(/è/g, 'e')}`}
          >
            <View style={[styles.tileIcon, { backgroundColor: `${tile.color}22` }]}>
              <Text style={styles.tileEmoji}>{tile.icon}</Text>
            </View>
            <View style={styles.tileContent}>
              <Text style={styles.tileName}>{tile.title}</Text>
              <Text style={styles.tileSub}>{tile.subtitle}</Text>
            </View>
            <Text style={styles.tileArrow}>›</Text>
          </TouchableOpacity>
        ))}

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            💡 Configurez vos litières et gamelles pour les retrouver lors de la saisie rapide depuis le tableau de bord.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.xl,
    paddingBottom: Spacing.md,
  },
  title: { ...Typography.h2, color: Colors.textPrimary },
  subtitle: { ...Typography.caption, color: Colors.textSecondary, marginTop: 2 },
  scroll: { padding: Spacing.xl, gap: Spacing.md },
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: Radius.xl,
    padding: Spacing.lg,
    ...Shadow.card,
  },
  tileIcon: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  tileEmoji: { fontSize: 26 },
  tileContent: { flex: 1 },
  tileName: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary },
  tileSub: { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  tileArrow: { fontSize: 22, color: Colors.textMuted },
  infoBox: {
    backgroundColor: Colors.primaryLight,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
  },
  infoText: { fontSize: 13, color: Colors.primary, lineHeight: 20 },
});
