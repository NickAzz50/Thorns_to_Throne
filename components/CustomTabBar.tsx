import { Ionicons } from '@expo/vector-icons';
import { View, Pressable, Text, StyleSheet } from 'react-native';

const routeConfigs: Record<string, { label: string; icon: string }> = {
  messages: { label: 'Messages', icon: 'chatbubble-ellipses-outline' },
  index: { label: 'Home', icon: 'home-outline' },
  account: { label: 'Account', icon: 'person-outline' },
};

export default function CustomTabBar({ state, descriptors, navigation }: any) {
  return (
    <View style={styles.container}>
      {state.routes.map((route: any, index: number) => {
        const { name } = route;
        const config = routeConfigs[name];
        if (!config) return null;

        const isFocused = state.index === index;

        return (
          <Pressable
            key={name}
            onPress={() => {
              if (!isFocused) navigation.navigate(name);
            }}
            style={styles.tab}
          >
            <Ionicons
              name={config.icon as any}
              size={24}
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
    bottom: 30,
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
    shadowRadius: 10,
    elevation: 14,
    overflow: 'hidden',
  },
  tab: {
    alignItems: 'center',
  },
  label: {
    fontFamily: 'Prata',
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});
