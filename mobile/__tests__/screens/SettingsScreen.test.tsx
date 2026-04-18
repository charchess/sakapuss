import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { SettingsScreen } from '../../src/screens/SettingsScreen';
import { AuthStore } from '../../src/store/auth';

jest.mock('expo-status-bar', () => ({ StatusBar: () => null }));

jest.spyOn(Alert, 'alert');

beforeEach(async () => {
  jest.clearAllMocks();
  await AuthStore.setUser({ id: 'u1', email: 'test@test.com', display_name: 'Testeur', role: 'admin' });
});

test('affiche les infos utilisateur', async () => {
  const { findByText } = render(<SettingsScreen onLogout={jest.fn()} />);
  await findByText('Testeur');
  await findByText('test@test.com');
});

test('affiche l\'URL du serveur', async () => {
  const { findByText } = render(<SettingsScreen onLogout={jest.fn()} />);
  await findByText('http://localhost:8000');
});

test('affiche le nombre d\'événements en attente', async () => {
  const { findByText } = render(<SettingsScreen onLogout={jest.fn()} />);
  await findByText('0 événements');
});

test('peut modifier l\'URL du serveur', async () => {
  const { findByText, getByPlaceholderText } = render(<SettingsScreen onLogout={jest.fn()} />);
  const editBtn = await findByText('Modifier ›');
  fireEvent.press(editBtn);
  const input = getByPlaceholderText('http://localhost:8000');
  fireEvent.changeText(input, 'http://192.168.1.100:8000');
  const saveBtn = await findByText('Sauvegarder');
  fireEvent.press(saveBtn);
  await waitFor(() => {
    expect(Alert.alert).toHaveBeenCalledWith('Sauvegardé', 'URL du serveur mise à jour.');
  });
});

test('URL vide → alerte validation', async () => {
  const { findByText, getByPlaceholderText } = render(<SettingsScreen onLogout={jest.fn()} />);
  const editBtn = await findByText('Modifier ›');
  fireEvent.press(editBtn);
  const input = getByPlaceholderText('http://localhost:8000');
  fireEvent.changeText(input, '   ');
  const saveBtn = await findByText('Sauvegarder');
  fireEvent.press(saveBtn);
  await waitFor(() => {
    expect(Alert.alert).toHaveBeenCalledWith('URL invalide', 'Veuillez saisir une URL valide.');
  });
});

test('appuyer sur déconnexion ouvre une confirmation', async () => {
  const { findByText } = render(<SettingsScreen onLogout={jest.fn()} />);
  const logoutBtn = await findByText('Se déconnecter');
  fireEvent.press(logoutBtn);
  expect(Alert.alert).toHaveBeenCalledWith(
    'Déconnexion',
    'Êtes-vous sûr de vouloir vous déconnecter ?',
    expect.any(Array)
  );
});

test('confirmation déconnexion appelle onLogout', async () => {
  const onLogout = jest.fn();
  (Alert.alert as jest.Mock).mockImplementation((_title, _msg, buttons) => {
    const confirm = buttons.find((b: any) => b.style === 'destructive');
    confirm?.onPress?.();
  });
  const { findByText } = render(<SettingsScreen onLogout={onLogout} />);
  const logoutBtn = await findByText('Se déconnecter');
  fireEvent.press(logoutBtn);
  await waitFor(() => expect(onLogout).toHaveBeenCalled());
});
