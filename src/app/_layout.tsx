import { DarkTheme, ThemeProvider } from 'expo-router';
import { useState } from 'react';
import { View } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { LoginScreen } from '@/components/login-screen';

export default function RootLayout() {
  const [authenticated, setAuthenticated] = useState(false);

  if (!authenticated) {
    return (
      <View style={{ flex: 1 }}>
        <AnimatedSplashOverlay />
        <LoginScreen onLogin={() => setAuthenticated(true)} />
      </View>
    );
  }

  return (
    <ThemeProvider value={DarkTheme}>
      <AppTabs />
    </ThemeProvider>
  );
}
