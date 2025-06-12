import { View, TextInput, FlatList, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/src/context/AuthContext';

type Track = {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    images: { url: string }[];
  };
};

export default function SongSearchScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const { session } = useAuth();
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Track[]>([]);
  const [loading, setLoading] = useState(false);

  const searchSpotify = async () => {
    if (!token || !query.trim()) return;

    setLoading(true);

    try {
      const res = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      setResults(data.tracks.items);
    } catch (error) {
      console.error('Spotify search error:', error);
      Alert.alert('Error', 'Failed to search Spotify');
    }

    setLoading(false);
  };

  const selectTrack = async (track: Track) => {
    if (!session?.user) return;

    const { name: title, artists, album } = track;
    const artist = artists.map(a => a.name).join(', ');
    const albumArt = album.images[0]?.url ?? null;

    const { error } = await supabase
      .from('profiles')
      .update({
        favorite_song_title: title,
        favorite_song_artist: artist,
        favorite_song_album_art: albumArt,
      })
      .eq('id', session.user.id);

    if (error) {
      console.error('Supabase update error:', error);
      Alert.alert('Error', 'Failed to save favorite song');
    } else {
      Alert.alert('Saved', `${title} by ${artist} saved as your favorite song`);
      router.replace('/account'); // Return to account screen
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Search for your favorite song</Text>
      <TextInput
        placeholder="Type a song name..."
        style={styles.input}
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={searchSpotify}
        returnKeyType="search"
      />
      <FlatList
        data={results}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.trackItem} onPress={() => selectTrack(item)}>
            {item.album.images[0]?.url && (
              <Image source={{ uri: item.album.images[0].url }} style={styles.albumArt} />
            )}
            <View style={styles.trackInfo}>
              <Text style={styles.trackTitle}>{item.name}</Text>
              <Text style={styles.trackArtist}>{item.artists.map(a => a.name).join(', ')}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={!loading && query ? <Text style={styles.noResults}>No results found.</Text> : null}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontFamily: 'Prata',
    fontSize: 20,
    marginBottom: 12,
    textAlign: 'center',
    color: '#149fa8',
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    fontSize: 16,
    fontFamily: 'Prata',
    marginBottom: 16,
  },
  trackItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'center',
  },
  albumArt: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginRight: 12,
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Prata',
  },
  trackArtist: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'Prata',
  },
  noResults: {
    textAlign: 'center',
    marginTop: 20,
    fontFamily: 'Prata',
    fontSize: 16,
    color: '#999',
  },
});
