import { View, Text, StyleSheet } from 'react-native';

export default function Help() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Help content coming soon...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 10 },
  text: { fontSize: 16, fontFamily: 'Prata' },
});
