let _store = {};

const AsyncStorage = {
  getItem: jest.fn((key) => Promise.resolve(_store[key] ?? null)),
  setItem: jest.fn((key, value) => { _store[key] = String(value); return Promise.resolve(); }),
  removeItem: jest.fn((key) => { delete _store[key]; return Promise.resolve(); }),
  multiRemove: jest.fn((keys) => { keys.forEach((k) => delete _store[k]); return Promise.resolve(); }),
  clear: jest.fn(() => { _store = {}; return Promise.resolve(); }),
  getAllKeys: jest.fn(() => Promise.resolve(Object.keys(_store))),
};

export const __resetStore = () => { _store = {}; };
export default AsyncStorage;
