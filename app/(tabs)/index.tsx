import { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/src/context/AuthContext';
import { format } from 'date-fns';

export default function HomeScreen() {
  const { session } = useAuth();
  const [firstName, setFirstName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [verse, setVerse] = useState<{ text: string; reference: string } | null>(null);
  const [currentUTCDate, setCurrentUTCDate] = useState(getUTCDate());

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
    const fetchVerse = async () => {
      try {
        const res = await fetch('https://beta.ourmanna.com/api/v1/get?format=json');
        const json = await res.json();
        const det = json.verse.details;
        const newVerse = { text: det.text, reference: det.reference };
        setVerse(newVerse);
      } catch (err) {
        console.error('Verse fetch error:', err);
      }
    };

    fetchVerse();
  }, [currentUTCDate]);

  useEffect(() => {
    const interval = setInterval(() => {
      const newDate = getUTCDate();
      if (newDate !== currentUTCDate) {
        setCurrentUTCDate(newDate);
      }
    }, 60 * 1000);
    return () => clearInterval(interval);
  }, [currentUTCDate]);

  const todayFormatted = format(new Date(), 'MMMM d, yyyy');

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.welcomeText}>
          Welcome{firstName ? `, ${firstName}` : ''}!
        </Text>

        <View style={styles.verseContainer}>
          <Text style={styles.verseDate}>Verse for {todayFormatted}</Text>
          {verse ? (
            <>
              <Text style={styles.verseText}>"{verse.text}"</Text>
              <Text style={styles.verseRef}>— {verse.reference}</Text>
            </>
          ) : (
            <ActivityIndicator size="small" color="#149fa8" />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getUTCDate(): string {
  const now = new Date();
  return now.toISOString().split('T')[0]; // YYYY-MM-DD
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  welcomeText: {
    fontSize: 24,
    fontFamily: 'Prata',
    marginBottom: 24,
  },
  verseContainer: {
    backgroundColor: '#fff',
    borderColor: '#149fa8',
    borderWidth: 1.5,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  verseDate: {
    fontSize: 14,
    color: '#149fa8',
    fontFamily: 'Prata',
    marginBottom: 8,
    textAlign: 'center',
  },
  verseText: {
    fontSize: 18,
    fontFamily: 'Prata',
    textAlign: 'center',
    marginBottom: 12,
  },
  verseRef: {
    fontFamily: 'Prata',
    fontSize: 16,
    textAlign: 'right',
    color: '#149fa8',
  },
});
