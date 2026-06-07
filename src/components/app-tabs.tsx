import { Tabs } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SG } from '@/constants/colors';

type SymbolName = React.ComponentProps<typeof SymbolView>['name'];

function TabIcon({ name, color, size }: { name: SymbolName; color: string; size: number }) {
  return <SymbolView name={name} tintColor={color} size={size} />;
}

export default function AppTabs() {
  const insets = useSafeAreaInsets();

  // Android: insets.bottom = 0 (3 botões) ou ~24 (gestos) — sempre respeitamos
  // iOS: insets.bottom já cobre a home bar
  const bottomPad = Platform.OS === 'ios'
    ? Math.max(insets.bottom, 16)
    : Math.max(insets.bottom, 8);
  const tabBarHeight = Platform.OS === 'ios'
    ? 50 + bottomPad
    : 52 + bottomPad;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: SG.surface,
          borderTopColor: SG.border,
          borderTopWidth: 1,
          height: tabBarHeight,
          paddingBottom: bottomPad,
          paddingTop: 8,
        },
        tabBarActiveTintColor: SG.accent,
        tabBarInactiveTintColor: SG.muted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          letterSpacing: 0.3,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <TabIcon
              name={{ ios: 'house.fill', android: 'home', web: 'home' }}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: 'Chat IA',
          tabBarIcon: ({ color, size }) => (
            <TabIcon
              name={{ ios: 'bubble.left.fill', android: 'chat', web: 'chat' }}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="risco"
        options={{
          title: 'Risco',
          tabBarIcon: ({ color, size }) => (
            <TabIcon
              name={{ ios: 'exclamationmark.triangle.fill', android: 'warning', web: 'warning' }}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="campo"
        options={{
          title: 'Campo',
          tabBarIcon: ({ color, size }) => (
            <TabIcon
              name={{ ios: 'location.fill', android: 'location_on', web: 'location_on' }}
              color={color}
              size={size}
            />
          ),
        }}
      />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}
