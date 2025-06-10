import { Tabs } from 'expo-router';
import { Image, Text } from 'react-native';
import CustomTabBar from '../../components/CustomTabBar';

export const unstable_settings = {
  initialRouteName: 'index',
};

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerTitleAlign: 'center',
        headerTitle: () => (
          <Text
            style={{
              fontFamily: 'GreatVibes',
              fontSize: 28,
              color: '#149fa8',
            }}
          >
            Thorns to Thrones
          </Text>
        ),
        headerRight: () => (
          <Image
            source={require('../../assets/thorns_to_thrones_navbar_logo.png')}
            style={{
              width: 36,
              height: 36,
              marginRight: 12,
              borderRadius: 8,
            }}
            resizeMode="contain"
          />
        ),
      }}
    >
      <Tabs.Screen name="messages" options={{ title: 'Messages' }} />
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="account" options={{ title: 'Account' }} />
    </Tabs>
  );
}
