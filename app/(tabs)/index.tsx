import { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/src/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen() {
  const { session } = useAuth();
  const [firstName, setFirstName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [verse, setVerse] = useState<{ text: string; reference: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user) return setLoading(false);

      const { data, error } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error) console.error('Profile error:', error);
      else if (data) setFirstName(data.first_name);

      setLoading(false);
    };

    fetchProfile();
  }, [session]);

  useEffect(() => {
    const fetchOrLoadVerse = async () => {
      const todayKey = new Date().toISOString().split('T')[0]; // "YYYY-MM-DD"
      try {
        const cached = await AsyncStorage.getItem('verseOfTheDay');
        if (cached) {
          const parsed = JSON.parse(cached);
          if (parsed.date === todayKey) {
            setVerse(parsed.verse);
            return;
          }
        }

        const res = await fetch('https://beta.ourmanna.com/api/v1/get?format=json');
        const json = await res.json();
        const det = json.verse.details;
        const newVerse = { text: det.text, reference: det.reference };

        await AsyncStorage.setItem(
          'verseOfTheDay',
          JSON.stringify({ date: todayKey, verse: newVerse })
        );

        setVerse(newVerse);
      } catch (err) {
        console.error('Verse fetch error:', err);
      }
    };

    fetchOrLoadVerse();
  }, []);

  const getFormattedDate = () => {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container} style={{ backgroundColor: 'white' }}>
      <Text style={styles.welcome}>
        {firstName ? `Welcome, ${firstName}!` : 'Welcome!'}
      </Text>

      {verse && (
        <View style={styles.verseBox}>
          <Text style={styles.dateText}>{getFormattedDate()}</Text>
          <Text style={styles.verseText}>"{verse.text}"</Text>
          <Text style={styles.referenceText}>— {verse.reference}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: 'white',
    paddingTop: 48,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  welcome: {
    fontFamily: 'Prata',
    fontSize: 20,
    marginBottom: 24,
    textAlign: 'center',
  },
  verseBox: {
    borderWidth: 2,
    borderColor: '#444',
    borderRadius: 14,
    paddingVertical: 20,
    paddingHorizontal: 24,
    backgroundColor: '#fefefe',
    width: '100%',
    maxWidth: 400,
  },
  dateText: {
    fontFamily: 'Prata',
    fontSize: 14,
    marginBottom: 8,
    color: '#666',
    textAlign: 'center',
  },
  verseText: {
    fontFamily: 'Prata',
    fontSize: 16,
    fontStyle: 'italic',
    marginBottom: 8,
    textAlign: 'center',
  },
  referenceText: {
    fontFamily: 'Prata',
    fontSize: 14,
    textAlign: 'right',
    color: '#444',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
});
