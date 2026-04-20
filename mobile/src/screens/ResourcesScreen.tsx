import React, { useCallback, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  FlatList, ActivityIndicator, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { Colors, Radius, Spacing, Shadow, Typography } from '../constants/theme';
import { Resource } from '../api/client';
import { dataService } from '../store/dataService';

const LITTER_COLORS = ['#FDCB6E', '#00B894', '#6C5CE7', '#E17055', '#74B9FF', '#A29BFE'];

export function ResourcesScreen() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState(LITTER_COLORS[0]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await dataService.getResources('litter');
      setResources(data);
    } catch {
      setError('Impossible de charger les litières.');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleAdd = async () => {
    if (!name.trim()) { setError('Le nom est requis.'); return; }
    setSaving(true);
    setError(null);
    try {
      await dataService.createResource({ name: name.trim(), type: 'litter', color });
      setName('');
      setColor(LITTER_COLORS[0]);
      setShowForm(false);
      load();
    } catch {
      setError('Impossible de créer la litière.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (r: Resource) => {
    try {
      await dataService.updateResource(r.id, { enabled: !r.enabled });
      load();
    } catch {
      setError('Impossible de modifier.');
    }
  };

  const handleDelete = (r: Resource) => {
    Alert.alert('Supprimer', `Supprimer la litière "${r.name}" ?`, [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Supprimer', style: 'destructive',
        onPress: async () => {
          try {
            await dataService.deleteResource(r.id);
            load();
          } catch {
            setError('Impossible de supprimer.');
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" backgroundColor={Colors.background} />

      <View style={styles.header}>
        <Text style={styles.title}>Litières 🚽</Text>
        <TouchableOpacity onPress={() => setShowForm(!showForm)} style={styles.addBtn} testID="resource-add-btn">
          <Text style={styles.addBtnText}>{showForm ? '✕' : '+ Ajouter'}</Text>
        </TouchableOpacity>
      </View>

      {showForm && (
        <View style={styles.form}>
          <Text style={styles.formLabel}>Nom de la litière</Text>
          <TextInput
            style={styles.input}
            placeholder="ex: Litière salon, Grande caisse..."
            placeholderTextColor={Colors.textMuted}
            value={name}
            onChangeText={setName}
            autoFocus
            testID="resource-name-input"
          />
          <Text style={styles.formLabel}>Couleur</Text>
          <View style={styles.colorRow}>
            {LITTER_COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorDotSelected]}
                onPress={() => setColor(c)}
              />
            ))}
          </View>
          {error && <Text style={styles.errorText}>{error}</Text>}
          <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleAdd} disabled={saving} testID="resource-save-btn">
            {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Enregistrer</Text>}
          </TouchableOpacity>
        </View>
      )}

      {loading ? (
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={resources}
          keyExtractor={(r) => r.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🚽</Text>
              <Text style={styles.emptyText}>Aucune litière configurée</Text>
              <Text style={styles.emptyHint}>Ajoutez vos litières pour les sélectionner lors de la saisie rapide.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.card, !item.enabled && styles.cardDisabled]}>
              <View style={[styles.colorBar, { backgroundColor: item.color ?? Colors.accent }]} />
              <View style={styles.cardContent}>
                <Text style={[styles.cardName, !item.enabled && { color: Colors.textMuted }]}>{item.name}</Text>
                <Text style={styles.cardStatus}>{item.enabled ? 'Active' : 'Désactivée'}</Text>
              </View>
              <TouchableOpacity onPress={() => handleToggle(item)} style={styles.toggleBtn} testID={`resource-toggle-${item.id}`}>
                <Text style={styles.toggleBtnText}>{item.enabled ? 'Désactiver' : 'Activer'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(item)} style={styles.deleteBtn} testID={`resource-delete-${item.id}`}>
                <Text style={styles.deleteBtnText}>🗑</Text>
              </TouchableOpacity>
            </View>
          )}
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
  input: {
    backgroundColor: Colors.background, borderWidth: 1, borderColor: Colors.border,
    borderRadius: Radius.md, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 15, color: Colors.textPrimary, marginBottom: Spacing.md,
  },
  colorRow: { flexDirection: 'row', gap: 10, marginBottom: Spacing.md },
  colorDot: { width: 28, height: 28, borderRadius: 14 },
  colorDotSelected: { borderWidth: 3, borderColor: Colors.textPrimary },
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
    borderRadius: Radius.md, marginBottom: Spacing.sm, overflow: 'hidden', ...Shadow.card,
  },
  cardDisabled: { opacity: 0.5 },
  colorBar: { width: 6, alignSelf: 'stretch' },
  cardContent: { flex: 1, paddingHorizontal: Spacing.md, paddingVertical: Spacing.md },
  cardName: { fontSize: 15, fontWeight: '600', color: Colors.textPrimary },
  cardStatus: { fontSize: 12, color: Colors.textMuted, marginTop: 2 },
  toggleBtn: { paddingHorizontal: Spacing.sm, paddingVertical: Spacing.md },
  toggleBtnText: { fontSize: 12, color: Colors.primary, fontWeight: '600' },
  deleteBtn: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.md },
  deleteBtnText: { fontSize: 18 },
});
