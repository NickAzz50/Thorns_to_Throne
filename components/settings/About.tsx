import { View, Text, StyleSheet } from 'react-native';

export default function About() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>About this app...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingTop: 10 },
  text: { fontSize: 16, fontFamily: 'Prata' },
});
