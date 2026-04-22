import AsyncStorage from '@react-native-async-storage/async-storage';

export const ONBOARDING_KEY = 'sakapuss_onboarding';
export const MODULES_KEY = 'sakapuss_modules';

export type CategoryKey = 'pets' | 'modules' | 'health' | 'weight' | 'litter' | 'bowls' | 'food';
type State = Record<CategoryKey, boolean>;

export interface ModuleConfig {
  health: boolean;
  litter: boolean;
  bowls: boolean;
  food: boolean;
}

const defaultModules = (): ModuleConfig => ({ health: true, litter: true, bowls: true, food: false });
const defaults = (): State => ({ pets: false, modules: false, health: false, weight: false, litter: false, bowls: false, food: false });

export const OnboardingState = {
  async get(): Promise<State> {
    try {
      const val = await AsyncStorage.getItem(ONBOARDING_KEY);
      if (val) return { ...defaults(), ...JSON.parse(val) };
    } catch {}
    return defaults();
  },

  async markDone(category: CategoryKey): Promise<void> {
    const state = await this.get();
    state[category] = true;
    await AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify(state));
  },

  async isComplete(): Promise<boolean> {
    const state = await this.get();
    return state.health && state.weight && state.food;
  },

  async reset(): Promise<void> {
    await AsyncStorage.removeItem(ONBOARDING_KEY);
  },

  async getModules(): Promise<ModuleConfig> {
    try {
      const val = await AsyncStorage.getItem(MODULES_KEY);
      if (val) return { ...defaultModules(), ...JSON.parse(val) };
    } catch {}
    return defaultModules();
  },

  async setModules(config: ModuleConfig): Promise<void> {
    await AsyncStorage.setItem(MODULES_KEY, JSON.stringify(config));
  },
};
