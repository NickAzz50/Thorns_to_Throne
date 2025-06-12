import { Ionicons } from '@expo/vector-icons';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const routeConfigs: Record<string, { label: string; icon: string }> = {
  index: { label: 'Home', icon: 'home-outline' },
  messages: { label: 'Messages', icon: 'chatbubble-ellipses-outline' },
  create_post: { label: 'Post', icon: 'add-circle-outline' },
  search: { label: 'Search', icon: 'search-outline' },
  account: { label: 'Account', icon: 'person-outline' },
};

export default function CustomTabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const orderedTabs = ['index', 'messages', 'create_post', 'search', 'account'];

  return (
    <View style={[styles.container, { bottom: insets.bottom + 20 }]}>
      {orderedTabs.map((name, index) => {
        const route = state.routes.find((r: any) => r.name === name);
        if (!route) return null;

        const config = routeConfigs[name];
        const isFocused = state.index === state.routes.findIndex((r: any) => r.name === name);

        return (
          <Pressable
            key={name}
            onPress={() => {
              if (!isFocused) navigation.navigate(name);
            }}
            style={[styles.tab, name === 'create_post' && styles.centerTab]}
          >
            <Ionicons
              name={config.icon as any}
              size={name === 'create_post' ? 30 : 24}
              color={isFocused ? '#149fa8' : '#999'}
            />
            <Text style={[styles.label, isFocused && { color: '#149fa8' }]}>
              {config.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderRadius: 36,
    borderWidth: 2,
    borderColor: '#149fa8',
    backgroundColor: '#fff',
    paddingVertical: 14,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerTab: {
    transform: [{ translateY: -4 }],
  },
  label: {
    fontSize: 10,
    marginTop: 2,
    color: '#999',
    fontFamily: 'Prata_400Regular',
  },
});
