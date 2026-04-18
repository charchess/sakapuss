import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { LoginScreen } from '../../src/screens/LoginScreen';

jest.mock('../../src/api/client', () => ({
  api: {
    login: jest.fn(),
    register: jest.fn(),
  },
}));

jest.mock('../../src/store/auth', () => ({
  AuthStore: {
    setToken: jest.fn(() => Promise.resolve()),
    setUser: jest.fn(() => Promise.resolve()),
    getToken: jest.fn(() => Promise.resolve(null)),
    getBaseUrl: jest.fn(() => Promise.resolve('http://localhost:8000')),
  },
}));

import { api } from '../../src/api/client';

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders email input, password input, submit button', () => {
    const { getByPlaceholderText, getByText } = render(
      <LoginScreen onLoginSuccess={() => {}} />
    );
    expect(getByPlaceholderText('votre@email.com')).toBeTruthy();
    expect(getByPlaceholderText('••••••••')).toBeTruthy();
    expect(getByText('Se connecter')).toBeTruthy();
  });

  it('calls api.login with email/password when submit pressed', async () => {
    (api.login as jest.Mock).mockResolvedValue({
      access_token: 'tok',
      user: { id: '1', email: 'test@test.com', display_name: 'Test', role: 'user' },
    });
    const { getByPlaceholderText, getByText } = render(
      <LoginScreen onLoginSuccess={() => {}} />
    );
    fireEvent.changeText(getByPlaceholderText('votre@email.com'), 'test@test.com');
    fireEvent.changeText(getByPlaceholderText('••••••••'), 'password123');
    fireEvent.press(getByText('Se connecter'));
    await waitFor(() => {
      expect(api.login).toHaveBeenCalledWith('test@test.com', 'password123');
    });
  });

  it('calls onLoginSuccess prop after successful login', async () => {
    const onLoginSuccess = jest.fn();
    (api.login as jest.Mock).mockResolvedValue({
      access_token: 'tok',
      user: { id: '1', email: 'test@test.com', display_name: 'Test', role: 'user' },
    });
    const { getByPlaceholderText, getByText } = render(
      <LoginScreen onLoginSuccess={onLoginSuccess} />
    );
    fireEvent.changeText(getByPlaceholderText('votre@email.com'), 'test@test.com');
    fireEvent.changeText(getByPlaceholderText('••••••••'), 'password123');
    fireEvent.press(getByText('Se connecter'));
    await waitFor(() => {
      expect(onLoginSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it('shows an Alert on login error', async () => {
    jest.spyOn(Alert, 'alert');
    (api.login as jest.Mock).mockRejectedValue({ message: 'Invalid credentials' });
    const { getByPlaceholderText, getByText } = render(
      <LoginScreen onLoginSuccess={() => {}} />
    );
    fireEvent.changeText(getByPlaceholderText('votre@email.com'), 'bad@test.com');
    fireEvent.changeText(getByPlaceholderText('••••••••'), 'wrongpw');
    fireEvent.press(getByText('Se connecter'));
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Erreur', 'Invalid credentials');
    });
  });
});
