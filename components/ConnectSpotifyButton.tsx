import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { loginWithSpotify } from '@/lib/spotify/useSpotifyAuth';

export default function ConnectSpotifyButton() {
  const handlePress = async () => {
    try {
      const tokens = await loginWithSpotify();
      console.log('🎵 Spotify Tokens:', tokens);
      // TODO: Save tokens securely or pass them to next screen
    } catch (err: any) {
      console.error('Spotify login error:', err);
      Alert.alert('Error', err.message || 'Spotify login failed');
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handlePress}>
      <Text style={styles.text}>Connect Spotify</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#1DB954',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 20,
    alignItems: 'center',
  },
  text: {
    color: '#fff',
    fontFamily: 'Prata',
    fontSize: 16,
  },
});
