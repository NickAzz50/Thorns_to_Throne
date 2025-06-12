import { Tabs } from 'expo-router';
import { Image, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import CustomTabBar from '@/components/CustomTabBar';
import React, { useState } from 'react';
import SettingsDrawer from '@/components/SettingsDrawer';

export default function TabsLayout() {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <Tabs
        screenOptions={{
          headerTitle: 'Thorns to Throne',
          headerTitleAlign: 'center',
          headerTitleStyle: {
            fontFamily: 'GreatVibes',
            fontSize: 26,
            color: '#149fa8',
          },
          headerLeft: () => (
            <Pressable onPress={() => setDrawerOpen(true)} style={{ paddingLeft: 16 }}>
              <Ionicons name="settings-outline" size={24} color="#149fa8" />
            </Pressable>
          ),
          headerRight: () => (
            <Image
              source={require('@/assets/thorns_to_thrones_navbar_logo.png')}
              style={{ width: 36, height: 36, marginRight: 16 }}
              resizeMode="contain"
            />
          ),
        }}
        tabBar={(props) => <CustomTabBar {...props} />}
      />
      <SettingsDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
