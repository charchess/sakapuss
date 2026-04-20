import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Colors, Radius, Shadow } from '../constants/theme';
import { DashboardScreen } from '../screens/DashboardScreen';
import { TimelineScreen } from '../screens/TimelineScreen';
import { RemindersScreen } from '../screens/RemindersScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { QuickLogScreen } from '../screens/QuickLogScreen';
import { PetProfileScreen } from '../screens/PetProfileScreen';
import { AddPetScreen } from '../screens/AddPetScreen';
import { FoyerScreen } from '../screens/FoyerScreen';
import { ResourcesScreen } from '../screens/ResourcesScreen';
import { BowlsScreen } from '../screens/BowlsScreen';
import { FoodScreen } from '../screens/FoodScreen';

export type HomeStackParamList = {
  Dashboard: undefined;
  QuickLog: {
    type: string;
    label: string;
    icon: string;
    petId: string | null;
    petName: string;
  };
  PetProfile: {
    petId: string;
    petName: string;
    species: string;
    breed?: string;
    birthDate?: string;
  };
  AddPet: Record<string, never>;
};

export type AppTabParamList = {
  Accueil: undefined;
  Timeline: undefined;
  Rappels: undefined;
  Foyer: undefined;
  Paramètres: undefined;
};

export type FoyerStackParamList = {
  FoyerHome: undefined;
  Litières: undefined;
  Gamelles: undefined;
  Alimentation: undefined;
};

const HomeStack = createStackNavigator<HomeStackParamList>();
const FoyerStack = createStackNavigator<FoyerStackParamList>();
const Tab = createBottomTabNavigator<AppTabParamList>();

interface TabIconProps {
  icon: string;
  focused: boolean;
}

function TabIcon({ icon, focused }: TabIconProps) {
  return (
    <View style={[styles.tabIcon, focused && styles.tabIconActive]}>
      <Text style={styles.tabEmoji}>{icon}</Text>
    </View>
  );
}

interface Props {
  onLogout: () => void;
}

function HomeStackNavigator() {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTitleStyle: {
          color: Colors.textPrimary,
          fontWeight: '700',
          fontSize: 18,
        },
        cardStyle: { backgroundColor: Colors.background },
      }}
    >
      <HomeStack.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ headerShown: false }}
      />
      <HomeStack.Screen
        name="QuickLog"
        component={QuickLogScreen}
        options={({ route }) => ({
          title: route.params.label,
          headerBackTitle: 'Retour',
          headerTintColor: Colors.primary,
        })}
      />
      <HomeStack.Screen
        name="PetProfile"
        component={PetProfileScreen}
        options={({ route }) => ({
          title: route.params.petName,
          headerBackTitle: 'Accueil',
          headerTintColor: Colors.primary,
        })}
      />
      <HomeStack.Screen
        name="AddPet"
        component={AddPetScreen}
        options={{
          title: 'Nouvel animal',
          headerBackTitle: 'Accueil',
          headerTintColor: Colors.primary,
        }}
      />
    </HomeStack.Navigator>
  );
}

function FoyerStackNavigator() {
  return (
    <FoyerStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 0,
        },
        headerTitleStyle: { color: Colors.textPrimary, fontWeight: '700', fontSize: 18 },
        cardStyle: { backgroundColor: Colors.background },
      }}
    >
      <FoyerStack.Screen
        name="FoyerHome"
        component={FoyerScreen}
        options={{ headerShown: false }}
      />
      <FoyerStack.Screen
        name="Litières"
        component={ResourcesScreen}
        options={{ title: 'Litières', headerBackTitle: 'Foyer', headerTintColor: Colors.primary }}
      />
      <FoyerStack.Screen
        name="Gamelles"
        component={BowlsScreen}
        options={{ title: 'Gamelles', headerBackTitle: 'Foyer', headerTintColor: Colors.primary }}
      />
      <FoyerStack.Screen
        name="Alimentation"
        component={FoodScreen}
        options={{ title: 'Alimentation', headerBackTitle: 'Foyer', headerTintColor: Colors.primary }}
      />
    </FoyerStack.Navigator>
  );
}

export function AppNavigator({ onLogout }: Props) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 64,
          paddingBottom: 8,
          paddingTop: 4,
          ...Shadow.card,
        },
        tabBarActiveTintColor: Colors.tabActive,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="Accueil"
        component={HomeStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🏠" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Timeline"
        component={TimelineScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="📋" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Rappels"
        component={RemindersScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🔔" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Foyer"
        component={FoyerStackNavigator}
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="🏡" focused={focused} />
          ),
        }}
      />
      <Tab.Screen
        name="Paramètres"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon icon="⚙️" focused={focused} />
          ),
        }}
      >
        {() => <SettingsScreen onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabIcon: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconActive: {
    backgroundColor: Colors.primaryLight,
  },
  tabEmoji: {
    fontSize: 20,
  },
});
