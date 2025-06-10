import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Slot, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { AuthProvider, useAuth } from '@/src/context/AuthContext';
import { supabase } from '@/lib/supabase';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, error] = useFonts({
    GreatVibes: require('../assets/fonts/GreatVibes-Regular.ttf'),
    Prata: require('../assets/fonts/Prata-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded, error]);

  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <RootLayoutContent fontsLoaded={fontsLoaded} />
      </ThemeProvider>
    </AuthProvider>
  );
}

function RootLayoutContent({ fontsLoaded }: { fontsLoaded: boolean }) {
  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return <AuthGate><Slot /></AuthGate>;
}

function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const [checkingProfile, setCheckingProfile] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const redirectLogic = async () => {
      const currentPath = segments.join('/');

      if (!session?.user) {
        if (currentPath !== 'login' && currentPath !== 'signup') {
          router.replace('/login');
        }
        setCheckingProfile(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('first_name, last_name, uname')
        .eq('id', session.user.id)
        .single();

      const isIncomplete = error || !data || !data.first_name || !data.last_name || !data.uname;

      if (isIncomplete && currentPath !== 'complete-profile') {
        router.replace('/complete-profile');
      } else if (!isIncomplete && (currentPath === 'login' || currentPath === 'signup')) {
        router.replace('/');
      }

      setCheckingProfile(false);
    };

    if (!loading) {
      redirectLogic();
    }
  }, [session, loading]);

  if (loading || checkingProfile) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator />
      </View>
    );
  }

  return <>{children}</>;
}
