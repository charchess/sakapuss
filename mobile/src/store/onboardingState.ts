import AsyncStorage from '@react-native-async-storage/async-storage';

export const ONBOARDING_KEY = 'sakapuss_onboarding';

type CategoryKey = 'health' | 'weight' | 'food';
type State = Record<CategoryKey, boolean>;

const defaults = (): State => ({ health: false, weight: false, food: false });

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
};
