import React, { useCallback, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, ActivityIndicator, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Colors, Radius, Spacing, Shadow, Typography } from '../constants/theme';
import { api, Bowl } from '../api/client';

const BOWL_TYPES = [
  { key: 'food', label: 'Nourriture', icon: '🥣' },
  { key: 'water', label: 'Eau', icon: '💧' },
];

export function BowlsScreen() {
  const [bowls, setBowls] = useState<Bowl[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [bowlType, setBowlType] = useState<'food' | 'water'>('food');
  const [capacityG, setCapacityG] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.getBowls();
      setBowls(data);
    } catch {
      setError('Impossible de charger les gamelles.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleAdd = async () => {
    if (!name.trim()) { setError('Le nom est requis.'); return; }
    if (!location.trim()) { setError('L\'emplacement est requis.'); return; }
    setSaving(true);
    setError(null);
    try {
      await api.createBowl({
        name: name.trim(),
        location: location.trim(),
        bowl_type: bowlType,
        capacity_g: capacityG ? parseInt(capacityG) : undefined,
      });
      setName('');
      setLocation('');
      setCapacityG('');
      setBowlType('food');
      setShowForm(false);
      load();
    } catch {
      setError('Impossible de créer la gamelle.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (b: Bowl) => {
    Alert.alert('Supprimer', `Supprimer la gamelle "${b.name}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => {
          try { await api.deleteBowl(b.id); load(); }
          catch { setError('Impossible de supprimer.'); }
        },
      },
    ]);
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" backgroundColor={Colors.background} />

      <View style={styles.header}>
        <Text style={styles.title}>Gamelles 🥣</Text>
        <TouchableOpacity onPress={() => setShowForm(!showForm)} style={styles.addBtn} testID="bowl-add-btn">
          <Text style={styles.addBtnText}>{showForm ? '✕' : '+ Ajouter'}</Text>
        </TouchableOpacity>
      </View>

      {showForm && (
        <View style={styles.form}>
          <Text style={styles.formLabel}>Type</Text>
          <View style={styles.typeRow}>
            {BOWL_TYPES.map((t) => (
              <TouchableOpacity
                key={t.key}
                style={[styles.typeBtn, bowlType === t.key && styles.typeBtnActive]}
                onPress={() => setBowlType(t.key as 'food' | 'water')}
              >
                <Text style={styles.typeBtnIcon}>{t.icon}</Text>
                <Text style={[styles.typeBtnText, bowlType === t.key && styles.typeBtnTextActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.formLabel}>Nom</Text>
          <TextInput
            style={styles.input}
            placeholder="ex: Gamelle cuisine, Gamelle Caramel..."
            placeholderTextColor={Colors.textMuted}
            value={name}
            onChangeText={setName}
            testID="bowl-name-input"
          />

          <Text style={styles.formLabel}>Emplacement</Text>
          <TextInput
            style={styles.input}
            placeholder="ex: Cuisine, Salon..."
            placeholderTextColor={Colors.textMuted}
            value={location}
            onChangeText={setLocation}
            testID="bowl-location-input"
          />

          <Text style={styles.formLabel}>Capacité en grammes (optionnel)</Text>
          <TextInput
            style={styles.input}
            placeholder="ex: 200"
            placeholderTextColor={Colors.textMuted}
            keyboardType="numeric"
            value={capacityG}
            onChangeText={setCapacityG}
          />

          {error && <Text style={styles.errorText}>{error}</Text>}
          <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleAdd} disabled={saving} testID="bowl-save-btn">
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Enregistrer</Text>}
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={bowls}
          keyExtractor={(b) => b.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🥣</Text>
              <Text style={styles.emptyText}>Aucune gamelle configurée</Text>
              <Text style={styles.emptyHint}>Ajoutez vos gamelles pour les sélectionner lors de la saisie rapide.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const type = BOWL_TYPES.find((t) => t.key === item.bowl_type);
            return (
              <View style={styles.card}>
                <Text style={styles.cardIcon}>{type?.icon ?? '🥣'}</Text>
                <View style={styles.cardContent}>
                  <Text style={styles.cardName}>{item.name}</Text>
                  <Text style={styles.cardSub}>
                    {item.location} · {type?.label}
                    {item.capacity_g ? ` · ${item.capacity_g}g` : ''}
                  </Text>
                </View>
                <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn}>
                  <Text style={styles.deleteBtnText}>🗑</Text>
                </TouchableOpacity>
              </View>
            );
          }}
        />
      )}
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
  form: {
    backgroundColor: Colors.surface, marginHorizontal: Spacing.xl,
    borderRadius: Radius.xl, padding: Spacing.xl, marginBottom: Spacing.md, ...Shadow.card,
  },
  formLabel: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary, marginBottom: 6 },
  typeRow: { flexDirection: 'row', gap: 10, marginBottom: Spacing.md },
  typeBtn: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: 6, paddingVertical: 10, borderRadius: Radius.md,
    borderWidth: 1.5, borderColor: Colors.border, backgroundColor: Colors.background,
  },
  typeBtnActive: { borderColor: Colors.primary, backgroundColor: Colors.primaryLight },
  typeBtnIcon: { fontSize: 18 },
  typeBtnText: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary },
  typeBtnTextActive: { color: Colors.primary },
  input: {
    backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: Colors.textPrimary, marginBottom: Spacing.md,
  },
  saveBtn: {
    backgroundColor: Colors.primary, borderRadius: Radius.md,
    paddingVertical: 12, alignItems: 'center',
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  errorText: { color: Colors.error, fontSize: 13, marginBottom: Spacing.sm },
  list: { paddingHorizontal: Spacing.xl, paddingBottom: 32 },
  emptyState: { alignItems: 'center', paddingTop: Spacing.xxl },
  emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
  emptyText: { ...Typography.h4, color: Colors.textSecondary, marginBottom: Spacing.sm },
  emptyHint: { fontSize: 13, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.surface,
    borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.sm, ...Shadow.card,
  },
  cardIcon: { fontSize: 28, marginRight: Spacing.md },
  cardContent: { flex: 1 },
  cardName: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  cardSub: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  deleteBtn: { padding: Spacing.sm },
  deleteBtnText: { fontSize: 18 },
});
