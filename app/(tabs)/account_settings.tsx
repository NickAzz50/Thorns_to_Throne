import { View, Text, TextInput, Button, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useEffect, useState } from 'react';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/src/context/AuthContext';

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

      if (!error && data) {
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
      Alert.alert('Error', 'Failed to update profile.');
    } else {
      Alert.alert('Saved', 'Profile saved!');
    }
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images, // still works despite deprecation warning
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets.length > 0) {
      const file = {
        uri: result.assets[0].uri,
        type: 'image/jpeg',
        name: `avatar-${Date.now()}.jpg`,
      };

      const response = await fetch(file.uri);
      const blob = await response.blob();

      if (!session?.user) return;
      const user = session.user;

      const filePath = `${user.id}/${Date.now()}.jpg`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, {
          upsert: true,
        });

      if (uploadError) {
        console.error('Avatar upload error:', uploadError);
        Alert.alert('Error', 'Failed to upload avatar.');
        return;
      }

      // 👇 manually set the `owner` on the storage.objects row
      const { error: ownerError } = await supabase
        .from('storage.objects')
        .update({ owner: user.id })
        .eq('bucket_id', 'avatars')
        .eq('name', filePath.split('/').pop());

      if (ownerError) {
        console.error('Failed to update owner on storage object:', ownerError);
      }

      const publicUrl = supabase.storage.from('avatars').getPublicUrl(filePath).data.publicUrl;

      const { error: updateProfileError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateProfileError) {
        console.error('Failed to update profile with avatar URL:', updateProfileError);
      } else {
        setAvatarUrl(publicUrl);
        Alert.alert('Avatar updated!');
      }
    }
  };

  return (
    <View style={styles.container}>
      {avatarUrl ? (
        <Image source={{ uri: avatarUrl }} style={styles.avatar} />
      ) : (
        <TouchableOpacity style={[styles.avatar, styles.placeholder]} onPress={handlePickImage}>
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
