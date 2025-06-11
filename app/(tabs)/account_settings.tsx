import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/src/context/AuthContext';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase-constants';

export default function AccountSettingsScreen() {
  const { session } = useAuth();
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!session?.user) return;

      const { data, error } = await supabase
        .from('profiles')
        .select('bio, avatar_url')
        .eq('id', session.user.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        Alert.alert('Error', 'Failed to load profile.');
      } else if (data) {
        setBio(data.bio || '');
        setAvatarUrl(data.avatar_url);
      }
    };

    loadProfile();
  }, [session]);

  const handleSave = async () => {
    if (!session?.user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ bio })
      .eq('id', session.user.id);

    if (error) {
      console.error('Bio update error:', error);
      Alert.alert('Error', 'Failed to update profile.');
    } else {
      Alert.alert('Saved', 'Profile saved!');
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
      base64: true,
    });

    if (!result.canceled && result.assets.length > 0) {
      const asset = result.assets[0];

      try {
        if (!session?.user) return;

        const filePath = `${session.user.id}/${Date.now()}.jpg`;

        if (!asset.base64) {
          throw new Error('Base64 data missing from asset');
        }

        const binary = atob(asset.base64);
        const byteArray = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          byteArray[i] = binary.charCodeAt(i);
        }

        const { data: sessionData } = await supabase.auth.getSession();
        const accessToken = sessionData?.session?.access_token;

        if (!accessToken) {
          console.error('No access token available');
          Alert.alert('Error', 'Not authenticated.');
          return;
        }

        const supabaseAuthClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
          global: {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          },
        });

        console.log('Uploading with UID:', session.user.id);
        console.log('File path:', filePath);
        console.log('Byte length:', byteArray.length);

        const { error: uploadError } = await supabaseAuthClient.storage
          .from('avatars')
          .upload(filePath, byteArray.buffer, {
            contentType: 'image/jpeg',
            upsert: true,
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          Alert.alert('Error', 'Failed to upload avatar.');
          return;
        }

        // 🔁 Call Edge Function to set owner
        const functionUrl = `https://${SUPABASE_URL.split('//')[1]}/functions/v1/set-avatar-owner`;
        const res = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            user_id: session.user.id,
            file_path: filePath,
          }),
        });

        const responseJson = await res.json();

        if (!res.ok) {
          console.error('Failed to set owner on avatar object:', responseJson);
        } else {
          console.log('✅ Owner set successfully:', responseJson);
        }

        // 🎯 Get public URL
        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        const publicUrl = urlData.publicUrl;

        console.log('Uploaded file path:', filePath);
        console.log('Public URL:', publicUrl);

        const { error: updateProfileError } = await supabase
          .from('profiles')
          .update({ avatar_url: publicUrl })
          .eq('id', session.user.id);

        if (updateProfileError) {
          console.error('Failed to update avatar URL:', updateProfileError);
          Alert.alert('Error', 'Failed to save avatar URL.');
        } else {
          setAvatarUrl(publicUrl);
          Alert.alert('Avatar Updated', 'Your avatar has been updated.');
        }
      } catch (err) {
        console.error('Unexpected error during image upload:', err);
        Alert.alert('Error', 'An unexpected error occurred during image upload.');
      }
    }
  };

  return (
    <View style={styles.container}>
      {avatarUrl ? (
        <Image
          source={{ uri: avatarUrl }}
          style={styles.avatar}
          onError={() => {
            console.warn('Failed to load avatar image from URL:', avatarUrl);
            Alert.alert('Error', 'Could not load avatar image.');
          }}
        />
      ) : (
        <TouchableOpacity
          style={[styles.avatar, styles.placeholder]}
          onPress={handlePickImage}
        >
          <Text style={styles.avatarText}>+</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={handlePickImage}>
        <Text style={styles.changeAvatar}>Change Avatar</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Bio</Text>
      <TextInput
        style={styles.input}
        value={bio}
        onChangeText={setBio}
        placeholder="Tell us something about yourself"
        multiline
      />
      <Button title="Save Changes" onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignSelf: 'center',
    marginBottom: 10,
  },
  placeholder: {
    backgroundColor: '#ccc',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 36,
    color: '#fff',
  },
  changeAvatar: {
    textAlign: 'center',
    color: '#149fa8',
    marginBottom: 20,
    fontFamily: 'Prata',
  },
  label: {
    fontSize: 18,
    marginBottom: 8,
    fontFamily: 'Prata',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    fontFamily: 'Prata',
    borderRadius: 6,
    marginBottom: 20,
    minHeight: 60,
    textAlignVertical: 'top',
  },
});
