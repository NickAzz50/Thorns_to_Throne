import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '@/src/context/AuthContext';
import { useEffect, useState, useCallback } from 'react';
import { useFocusEffect, useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function AccountScreen() {
  const { session } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);

  const fetchProfile = async () => {
    if (!session?.user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('first_name, last_name, uname, avatar_url, bio, following_count, follower_count')
      .eq('id', session.user.id)
      .single();

    if (!error) {
      setProfile(data);
    } else {
      console.error('Failed to fetch profile:', error);
    }
  };

  // Re-fetch profile whenever screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [session])
  );

  if (!profile) {
    return (
      <View style={styles.centered}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();

  return (
    <View style={styles.container}>
      {/* Settings button */}
      <TouchableOpacity style={styles.settingsIcon} onPress={() => router.push('/account_settings')}>
        <Ionicons name="settings-outline" size={24} color="#149fa8" />
      </TouchableOpacity>

      {/* Profile picture or fallback */}
      {profile.avatar_url ? (
        <Image source={{ uri: profile.avatar_url }} style={styles.avatar} />
      ) : (
        <View style={[styles.avatar, styles.placeholderAvatar]}>
          <Ionicons name="person" size={40} color="#999" />
        </View>
      )}

      {/* Name & Username */}
      <Text style={styles.name}>{fullName}</Text>
      <Text style={styles.username}>@{profile.uname}</Text>

      {/* Bio (if present) */}
      {profile.bio ? (
        <Text style={styles.bio}>{profile.bio}</Text>
      ) : null}

      {/* Follower stats */}
      <View style={styles.statsRow}>
        <View style={styles.statBlock}>
          <Text style={styles.statNumber}>{profile.following_count || 0}</Text>
          <Text style={styles.statLabel}>Following</Text>
        </View>
        <View style={styles.statBlock}>
          <Text style={styles.statNumber}>{profile.follower_count || 0}</Text>
          <Text style={styles.statLabel}>Followers</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    paddingTop: 40,
    backgroundColor: '#fff',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsIcon: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
  },
  placeholderAvatar: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#eee',
  },
  name: {
    fontSize: 30,
    fontFamily: 'Prata',
    color: '#333',
    marginBottom: 4,
  },
  username: {
    fontSize: 20,
    color: '#555',
    fontFamily: 'Prata',
    marginBottom: 4,
  },
  bio: {
    fontSize: 16,
    fontFamily: 'Prata',
    color: '#666',
    marginBottom: 20,
    paddingHorizontal: 20,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
  },
  statBlock: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Prata',
    color: '#149fa8',
  },
  statLabel: {
    fontSize: 18,
    fontFamily: 'Prata',
    color: '#555',
  },
});
