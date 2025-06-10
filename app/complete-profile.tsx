import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/src/context/AuthContext';

export default function CompleteProfile() {
  const { session } = useAuth();
  const router = useRouter();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');

  const handleSaveProfile = async () => {
    if (!firstName || !lastName || !username) {
      Alert.alert('Please fill out all fields');
      return;
    }

    const userId = session?.user.id;

    if (!userId) {
      Alert.alert('Error', 'No user session found');
      return;
    }

    // Try to update first
    const { data: updateData, error: updateError } = await supabase
      .from('profiles')
      .update({ first_name: firstName, last_name: lastName, uname: username })
      .eq('id', userId)
      .select();

    if (updateError) {
      console.error('Error updating profile:', updateError);
      Alert.alert('Error', 'Failed to update profile');
      return;
    }

    // If no row was updated, insert a new row
    if (!updateData || updateData.length === 0) {
      const { error: insertError } = await supabase.from('profiles').insert({
        id: userId,
        first_name: firstName,
        last_name: lastName,
        uname: username,
      });

      if (insertError) {
        console.error('Error inserting profile:', insertError);
        Alert.alert('Error', 'Failed to create profile');
        return;
      }
    }

    router.replace('/');
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: 'white' }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={80}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 20 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' }}>
            Complete Your Profile
          </Text>

          <TextInput
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
            style={inputStyle}
          />
          <TextInput
            placeholder="Last Name"
            value={lastName}
            onChangeText={setLastName}
            style={inputStyle}
          />
          <TextInput
            placeholder="Username"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            style={inputStyle}
          />

          <Button title="Save Profile" onPress={handleSaveProfile} />
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const inputStyle = {
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 8,
  padding: 12,
  marginBottom: 16,
};
