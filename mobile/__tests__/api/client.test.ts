import { apiClient } from '../../src/api/client';
import { server } from '../mocks/server';

jest.mock('../../src/store/auth', () => ({
  AuthStore: {
    getToken: jest.fn(() => Promise.resolve('test-token')),
    getBaseUrl: jest.fn(() => Promise.resolve('http://localhost:8000')),
  },
}));

const mockFetch = jest.fn();

beforeAll(() => {
  // Disable MSW for these tests — we mock fetch directly
  server.close();
  global.fetch = mockFetch;
});

afterAll(() => {
  server.listen({ onUnhandledRequest: 'warn' });
});

beforeEach(() => {
  jest.clearAllMocks();
  mockFetch.mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({ data: 'test' }),
  });
});

describe('apiClient', () => {
  it('GET request: fetch called with correct URL, method GET, Authorization header', async () => {
    await apiClient.get('/api/pets');
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/pets',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      })
    );
  });

  it('POST request: fetch called with method POST, body JSON-stringified', async () => {
    const body = { email: 'a@a.com', password: 'pw' };
    await apiClient.post('/api/auth/login', body, true);
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/auth/login',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify(body),
      })
    );
  });

  it('Response 200: returns parsed JSON', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: '1', name: 'Luna' }),
    });
    const result = await apiClient.get('/api/pets/1');
    expect(result).toEqual({ id: '1', name: 'Luna' });
  });

  it('Response 401: throws ApiError with status: 401', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ detail: 'Unauthorized' }),
    });
    await expect(apiClient.get('/api/pets')).rejects.toMatchObject({ status: 401 });
  });

  it('Response 500 with detail field: error message is the detail value', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ detail: 'Internal server error' }),
    });
    await expect(apiClient.get('/api/pets')).rejects.toMatchObject({
      status: 500,
      message: 'Internal server error',
    });
  });

  it('skipAuth=true: no Authorization header added', async () => {
    await apiClient.post('/api/auth/login', {}, true);
    const call = mockFetch.mock.calls[0];
    expect(call[1].headers.Authorization).toBeUndefined();
  });

  it('Uses base URL from AuthStore.getBaseUrl()', async () => {
    const { AuthStore } = require('../../src/store/auth');
    AuthStore.getBaseUrl.mockResolvedValue('http://192.168.1.100:8000');
    await apiClient.get('/api/pets');
    expect(mockFetch).toHaveBeenCalledWith(
      'http://192.168.1.100:8000/api/pets',
      expect.anything()
    );
  });
});
