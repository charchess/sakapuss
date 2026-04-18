import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { AddPetScreen } from '../../src/screens/AddPetScreen';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

const BASE = 'http://localhost:8000';

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('expo-status-bar', () => ({ StatusBar: () => null }));

jest.spyOn(Alert, 'alert');

beforeEach(() => {
  mockNavigate.mockClear();
  mockGoBack.mockClear();
  jest.clearAllMocks();
  server.use(
    http.post(`${BASE}/pets`, () =>
      HttpResponse.json(
        { id: 'p_new', name: 'Nala', species: 'Cat', birth_date: '2023-01-01', breed: null, photo_url: null },
        { status: 201 }
      )
    )
  );
});

const props = {
  navigation: { navigate: mockNavigate, goBack: mockGoBack },
  route: { params: {} },
};

test('affiche les champs nom, espèce, date de naissance', () => {
  const { getByPlaceholderText } = render(<AddPetScreen {...props} />);
  expect(getByPlaceholderText(/nom/i)).toBeTruthy();
  expect(getByPlaceholderText(/espèce/i)).toBeTruthy();
  expect(getByPlaceholderText(/date.*naissance|YYYY-MM-DD/i)).toBeTruthy();
});

test('validation — nom vide → alerte', async () => {
  const { getByText } = render(<AddPetScreen {...props} />);
  fireEvent.press(getByText('Ajouter'));
  await waitFor(() => {
    expect(Alert.alert).toHaveBeenCalledWith('Champ requis', expect.stringContaining('nom'));
  });
});

test('validation — espèce vide → alerte', async () => {
  const { getByText, getByPlaceholderText } = render(<AddPetScreen {...props} />);
  fireEvent.changeText(getByPlaceholderText(/nom/i), 'Nala');
  fireEvent.press(getByText('Ajouter'));
  await waitFor(() => {
    expect(Alert.alert).toHaveBeenCalledWith('Champ requis', expect.stringContaining("espèce"));
  });
});

test('validation — date vide → alerte', async () => {
  const { getByText, getByPlaceholderText } = render(<AddPetScreen {...props} />);
  fireEvent.changeText(getByPlaceholderText(/nom/i), 'Nala');
  fireEvent.changeText(getByPlaceholderText(/espèce/i), 'Chat');
  fireEvent.press(getByText('Ajouter'));
  await waitFor(() => {
    expect(Alert.alert).toHaveBeenCalledWith('Champ requis', expect.stringContaining("date"));
  });
});

test('soumission réussie → goBack appelé', async () => {
  const { getByText, getByPlaceholderText } = render(<AddPetScreen {...props} />);
  fireEvent.changeText(getByPlaceholderText(/nom/i), 'Nala');
  fireEvent.changeText(getByPlaceholderText(/espèce/i), 'Chat');
  fireEvent.changeText(getByPlaceholderText(/date.*naissance|YYYY-MM-DD/i), '2023-01-15');
  fireEvent.press(getByText('Ajouter'));
  await waitFor(() => {
    expect(mockGoBack).toHaveBeenCalled();
  });
});

test('API échoue → alerte erreur', async () => {
  server.use(http.post(`${BASE}/pets`, () => HttpResponse.error()));
  const { getByText, getByPlaceholderText } = render(<AddPetScreen {...props} />);
  fireEvent.changeText(getByPlaceholderText(/nom/i), 'Nala');
  fireEvent.changeText(getByPlaceholderText(/espèce/i), 'Chat');
  fireEvent.changeText(getByPlaceholderText(/date.*naissance|YYYY-MM-DD/i), '2023-01-15');
  fireEvent.press(getByText('Ajouter'));
  await waitFor(() => {
    expect(Alert.alert).toHaveBeenCalledWith('Erreur', expect.any(String));
  });
});
