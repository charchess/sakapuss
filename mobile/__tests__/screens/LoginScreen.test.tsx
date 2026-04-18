import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { LoginScreen } from '../../src/screens/LoginScreen';
import { AuthStore } from '../../src/store/auth';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

const BASE = 'http://localhost:8000';
const mockOnSuccess = jest.fn();

beforeEach(() => {
  mockOnSuccess.mockClear();
});

test('renders email input, password input, submit button', () => {
  const { getByPlaceholderText, getByText } = render(
    <LoginScreen onLoginSuccess={mockOnSuccess} />
  );
  expect(getByPlaceholderText('votre@email.com')).toBeTruthy();
  expect(getByPlaceholderText('••••••••')).toBeTruthy();
  expect(getByText('Se connecter')).toBeTruthy();
});

test('login réussi appelle onLoginSuccess', async () => {
  const { getByPlaceholderText, getByText } = render(
    <LoginScreen onLoginSuccess={mockOnSuccess} />
  );
  fireEvent.changeText(getByPlaceholderText('votre@email.com'), 'test@test.com');
  fireEvent.changeText(getByPlaceholderText('••••••••'), 'password123');
  fireEvent.press(getByText('Se connecter'));
  await waitFor(() => expect(mockOnSuccess).toHaveBeenCalledTimes(1));
});

test('login échoué affiche une alerte', async () => {
  server.use(
    http.post(`${BASE}/auth/login`, () =>
      HttpResponse.json({ detail: 'Email ou mot de passe invalide' }, { status: 401 })
    )
  );
  const alertSpy = jest.spyOn(Alert, 'alert');
  const { getByPlaceholderText, getByText } = render(
    <LoginScreen onLoginSuccess={mockOnSuccess} />
  );
  fireEvent.changeText(getByPlaceholderText('votre@email.com'), 'wrong@test.com');
  fireEvent.changeText(getByPlaceholderText('••••••••'), 'wrong');
  fireEvent.press(getByText('Se connecter'));
  await waitFor(() => expect(alertSpy).toHaveBeenCalled());
  expect(mockOnSuccess).not.toHaveBeenCalled();
});

test('token stocké dans AuthStore après login réussi', async () => {
  const { getByPlaceholderText, getByText } = render(
    <LoginScreen onLoginSuccess={mockOnSuccess} />
  );
  fireEvent.changeText(getByPlaceholderText('votre@email.com'), 'test@test.com');
  fireEvent.changeText(getByPlaceholderText('••••••••'), 'password123');
  fireEvent.press(getByText('Se connecter'));
  await waitFor(() => expect(mockOnSuccess).toHaveBeenCalled());
  const token = await AuthStore.getToken();
  expect(token).toBe('test-token-123');
});
