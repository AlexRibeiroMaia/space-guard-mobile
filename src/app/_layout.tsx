import { DarkTheme, ThemeProvider } from 'expo-router';
import { View } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { LoginScreen } from '@/components/login-screen';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <AppRoot />
    </AuthProvider>
  );
}

function AppRoot() {
  const { user, login } = useAuth();

  if (!user) {
    return (
      <View style={{ flex: 1 }}>
        <AnimatedSplashOverlay />
        <LoginScreen onLogin={login} />
      </View>
    );
  }

  return (
    <ThemeProvider value={DarkTheme}>
      <AppTabs />
    </ThemeProvider>
  );
}
