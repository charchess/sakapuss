import React, { useCallback, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Colors, Radius, Spacing, Shadow, Typography } from '../constants/theme';
import { api, FoodProduct, FoodBag } from '../api/client';

const FOOD_TYPES = ['Croquettes', 'Pâtée', 'Mixte', 'Friandises'];
const FOOD_CATEGORIES = ['Principal', 'Complément', 'Plaisir'];
const BAG_STATUS_COLORS: Record<string, string> = {
  stocked: Colors.info,
  opened: Colors.success,
  depleted: Colors.textMuted,
};
const BAG_STATUS_LABELS: Record<string, string> = {
  stocked: 'En stock',
  opened: 'Ouvert',
  depleted: 'Épuisé',
};

export function FoodScreen() {
  const [products, setProducts] = useState<FoodProduct[]>([]);
  const [bags, setBags] = useState<FoodBag[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<'products' | 'bags'>('products');
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Product form
  const [pName, setPName] = useState('');
  const [pBrand, setPBrand] = useState('');
  const [pType, setPType] = useState(FOOD_TYPES[0]);
  const [pCategory, setPCategory] = useState(FOOD_CATEGORIES[0]);
  const [pDefaultWeight, setPDefaultWeight] = useState('');

  // Bag form
  const [bagProductId, setBagProductId] = useState('');
  const [bagWeight, setBagWeight] = useState('');
  const [bagPurchased, setBagPurchased] = useState(
    new Date().toISOString().split('T')[0]
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, b] = await Promise.all([api.getFoodProducts(), api.getFoodBags()]);
      setProducts(p);
      setBags(b.filter((bag) => bag.status !== 'depleted'));
      if (p.length > 0 && !bagProductId) setBagProductId(p[0].id);
    } catch {
      setError('Impossible de charger les aliments.');
    } finally {
      setLoading(false);
    }
  }, [bagProductId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleAddProduct = async () => {
    if (!pName.trim() || !pBrand.trim()) { setError('Nom et marque requis.'); return; }
    setSaving(true);
    setError(null);
    try {
      await api.createFoodProduct({
        name: pName.trim(),
        brand: pBrand.trim(),
        food_type: pType,
        food_category: pCategory,
        default_bag_weight_g: pDefaultWeight ? parseInt(pDefaultWeight) : undefined,
      });
      setPName(''); setPBrand(''); setPDefaultWeight('');
      setShowForm(false);
      load();
    } catch {
      setError('Impossible de créer le produit.');
    } finally {
      setSaving(false);
    }
  };

  const handleAddBag = async () => {
    if (!bagProductId || !bagWeight) { setError('Produit et poids requis.'); return; }
    setSaving(true);
    setError(null);
    try {
      await api.createFoodBag({
        product_id: bagProductId,
        weight_g: parseInt(bagWeight),
        purchased_at: bagPurchased,
      });
      setBagWeight('');
      setShowForm(false);
      load();
    } catch {
      setError('Impossible de créer le sac.');
    } finally {
      setSaving(false);
    }
  };

  const handleOpenBag = async (id: string) => {
    try { await api.openFoodBag(id); load(); }
    catch { setError('Erreur.'); }
  };

  const handleDepleteBag = (id: string, name: string) => {
    Alert.alert('Sac épuisé', `Marquer "${name}" comme épuisé ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Épuisé', style: 'destructive',
        onPress: async () => {
          try { await api.depleteFoodBag(id); load(); }
          catch { setError('Erreur.'); }
        },
      },
    ]);
  };

  const handleDeleteProduct = (p: FoodProduct) => {
    Alert.alert('Supprimer', `Supprimer "${p.name}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => {
          try { await api.deleteFoodProduct(p.id); load(); }
          catch { setError('Impossible de supprimer.'); }
        },
      },
    ]);
  };

  const productName = (id: string) => products.find((p) => p.id === id)?.name ?? '—';

  return (
    <View style={styles.root}>
      <StatusBar style="dark" backgroundColor={Colors.background} />

      <View style={styles.header}>
        <Text style={styles.title}>Alimentation 🍽️</Text>
        <TouchableOpacity onPress={() => setShowForm(!showForm)} style={styles.addBtn} testID="food-add-btn">
          <Text style={styles.addBtnText}>{showForm ? '✕' : '+ Ajouter'}</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['products', 'bags'] as const).map((t) => (
          <TouchableOpacity
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => { setTab(t); setShowForm(false); }}
            testID={`food-tab-${t}`}
          >
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'products' ? 'Produits' : 'Sacs en cours'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Add form */}
        {showForm && tab === 'products' && (
          <View style={styles.form}>
            <Text style={styles.formTitle}>Nouveau produit</Text>

            <Text style={styles.formLabel}>Type</Text>
            <View style={styles.pillRow}>
              {FOOD_TYPES.map((ft) => (
                <TouchableOpacity
                  key={ft}
                  style={[styles.pill, pType === ft && styles.pillActive]}
                  onPress={() => setPType(ft)}
                >
                  <Text style={[styles.pillText, pType === ft && styles.pillTextActive]}>{ft}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.formLabel}>Catégorie</Text>
            <View style={styles.pillRow}>
              {FOOD_CATEGORIES.map((fc) => (
                <TouchableOpacity
                  key={fc}
                  style={[styles.pill, pCategory === fc && styles.pillActive]}
                  onPress={() => setPCategory(fc)}
                >
                  <Text style={[styles.pillText, pCategory === fc && styles.pillTextActive]}>{fc}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.formLabel}>Nom du produit</Text>
            <TextInput style={styles.input} placeholder="ex: Adult Indoor" placeholderTextColor={Colors.textMuted} value={pName} onChangeText={setPName} testID="product-name-input" />

            <Text style={styles.formLabel}>Marque</Text>
            <TextInput style={styles.input} placeholder="ex: Royal Canin, Hill's..." placeholderTextColor={Colors.textMuted} value={pBrand} onChangeText={setPBrand} testID="product-brand-input" />

            <Text style={styles.formLabel}>Poids sac par défaut (g, optionnel)</Text>
            <TextInput style={styles.input} placeholder="ex: 2000" placeholderTextColor={Colors.textMuted} keyboardType="numeric" value={pDefaultWeight} onChangeText={setPDefaultWeight} />

            {error && <Text style={styles.errorText}>{error}</Text>}
            <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleAddProduct} disabled={saving} testID="product-save-btn">
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Enregistrer</Text>}
            </TouchableOpacity>
          </View>
        )}

        {showForm && tab === 'bags' && (
          <View style={styles.form}>
            <Text style={styles.formTitle}>Nouveau sac</Text>

            <Text style={styles.formLabel}>Produit</Text>
            {products.length === 0 ? (
              <Text style={styles.hintText}>Ajoutez d'abord un produit.</Text>
            ) : (
              products.map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[styles.productOption, bagProductId === p.id && styles.productOptionActive]}
                  onPress={() => setBagProductId(p.id)}
                >
                  <Text style={[styles.productOptionText, bagProductId === p.id && { color: Colors.primary }]}>
                    {p.brand} {p.name}
                  </Text>
                </TouchableOpacity>
              ))
            )}

            <Text style={styles.formLabel}>Poids (g)</Text>
            <TextInput style={styles.input} placeholder="ex: 2000" placeholderTextColor={Colors.textMuted} keyboardType="numeric" value={bagWeight} onChangeText={setBagWeight} testID="bag-weight-input" />

            <Text style={styles.formLabel}>Date d'achat</Text>
            <TextInput style={styles.input} placeholder="YYYY-MM-DD" placeholderTextColor={Colors.textMuted} value={bagPurchased} onChangeText={setBagPurchased} />

            {error && <Text style={styles.errorText}>{error}</Text>}
            <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleAddBag} disabled={saving} testID="bag-save-btn">
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Enregistrer</Text>}
            </TouchableOpacity>
          </View>
        )}

        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
        ) : tab === 'products' ? (
          products.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🍽️</Text>
              <Text style={styles.emptyText}>Aucun produit alimentaire</Text>
              <Text style={styles.emptyHint}>Ajoutez les aliments de vos animaux pour suivre leur consommation.</Text>
            </View>
          ) : (
            products.map((p) => (
              <View key={p.id} style={styles.card}>
                <View style={styles.cardContent}>
                  <Text style={styles.cardName}>{p.name}</Text>
                  <Text style={styles.cardSub}>{p.brand} · {p.food_type} · {p.food_category}</Text>
                  {p.default_bag_weight_g ? (
                    <Text style={styles.cardSub}>Poids sac : {p.default_bag_weight_g}g</Text>
                  ) : null}
                </View>
                <TouchableOpacity onPress={() => handleDeleteProduct(p)} style={styles.deleteBtn}>
                  <Text style={styles.deleteBtnText}>🗑</Text>
                </TouchableOpacity>
              </View>
            ))
          )
        ) : (
          bags.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>📦</Text>
              <Text style={styles.emptyText}>Aucun sac en cours</Text>
              <Text style={styles.emptyHint}>Ajoutez un sac quand vous en ouvrez un nouveau.</Text>
            </View>
          ) : (
            bags.map((bag) => (
              <View key={bag.id} style={styles.card}>
                <View style={[styles.statusDot, { backgroundColor: BAG_STATUS_COLORS[bag.status] ?? Colors.textMuted }]} />
                <View style={styles.cardContent}>
                  <Text style={styles.cardName}>{productName(bag.product_id)}</Text>
                  <Text style={styles.cardSub}>
                    {bag.weight_g}g · {BAG_STATUS_LABELS[bag.status] ?? bag.status}
                  </Text>
                  {bag.opened_at ? (
                    <Text style={styles.cardSub}>Ouvert le {bag.opened_at.split('T')[0]}</Text>
                  ) : null}
                </View>
                <View style={styles.bagActions}>
                  {bag.status === 'stocked' && (
                    <TouchableOpacity onPress={() => handleOpenBag(bag.id)} style={styles.actionBtn} testID={`bag-open-${bag.id}`}>
                      <Text style={styles.actionBtnText}>Ouvrir</Text>
                    </TouchableOpacity>
                  )}
                  {bag.status === 'opened' && (
                    <TouchableOpacity onPress={() => handleDepleteBag(bag.id, productName(bag.product_id))} style={[styles.actionBtn, styles.actionBtnRed]} testID={`bag-deplete-${bag.id}`}>
                      <Text style={[styles.actionBtnText, { color: Colors.error }]}>Épuisé</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          )
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl, paddingTop: Spacing.xl, paddingBottom: Spacing.md,
  },
  title: { ...Typography.h3, color: Colors.textPrimary },
  addBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.full,
    paddingHorizontal: 14, paddingVertical: 6,
  },
  addBtnText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  tabs: {
    flexDirection: 'row', marginHorizontal: Spacing.xl, marginBottom: Spacing.md,
    backgroundColor: Colors.surface, borderRadius: Radius.md, padding: 4, ...Shadow.card,
  },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: Radius.sm },
  tabActive: { backgroundColor: Colors.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: Colors.textMuted },
  tabTextActive: { color: '#fff' },
  scroll: { paddingHorizontal: Spacing.xl, paddingBottom: 40 },
  form: {
    backgroundColor: Colors.surface, borderRadius: Radius.xl,
    padding: Spacing.xl, marginBottom: Spacing.md, ...Shadow.card,
  },
  formTitle: { ...Typography.h4, marginBottom: Spacing.md },
  formLabel: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, marginBottom: 6 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: Spacing.md },
  pill: {
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: Radius.full,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.background,
  },
  pillActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  pillText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  pillTextActive: { color: Colors.primary },
  input: {
    backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: Colors.textPrimary, marginBottom: Spacing.md,
  },
  hintText: { fontSize: 13, color: Colors.textMuted, marginBottom: Spacing.md },
  productOption: {
    padding: Spacing.md, borderRadius: Radius.md, borderWidth: 1.5,
    borderColor: Colors.border, marginBottom: Spacing.sm, backgroundColor: Colors.background,
  },
  productOptionActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  productOptionText: { fontSize: 14, fontWeight: '600', color: Colors.textPrimary },
  saveBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.md,
    paddingVertical: 12, alignItems: 'center', marginTop: Spacing.sm,
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  errorText: { color: Colors.error, fontSize: 13, marginBottom: Spacing.sm },
  emptyState: { alignItems: 'center', paddingTop: Spacing.xxl },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyText: { ...Typography.h4, color: Colors.textSecondary, marginBottom: Spacing.sm },
  emptyHint: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm, ...Shadow.card,
  },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: Spacing.md, alignSelf: 'center' },
  cardContent: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  cardSub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  bagActions: { flexDirection: 'row', gap: 6 },
  actionBtn: {
    paddingHorizontal: 10, paddingVertical: 6, borderRadius: Radius.sm,
    borderWidth: 1, borderColor: Colors.primary,
  },
  actionBtnRed: { borderColor: Colors.error },
  actionBtnText: { fontSize: 12, fontWeight: '600', color: Colors.primary },
  deleteBtn: { padding: Spacing.sm },
  deleteBtnText: { fontSize: 18 },
});
