import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Alert,
} from 'react-native';
import { supabase } from '@/lib/supabase';
import General from './settings/General';
import Notifications from './settings/Notifications';
import Activity from './settings/Activity';
import Help from './settings/Help';
import About from './settings/About';

const SCREEN_WIDTH = Dimensions.get('window').width;
const DRAWER_WIDTH = SCREEN_WIDTH * 0.8;
const NAVBAR_HEIGHT = 90;
const DRAWER_TOP_OFFSET = NAVBAR_HEIGHT + 40;

interface Props {
  visible: boolean;
  onClose: () => void;
}

const tabs = ['General', 'Notifications', 'Activity', 'Help', 'About', 'Logout'];

export default function SettingsDrawer({ visible, onClose }: Props) {
  const translateX = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const [rendered, setRendered] = useState(visible);
  const [activeTab, setActiveTab] = useState('General');

  useEffect(() => {
    if (visible) {
      setRendered(true);
      Animated.timing(translateX, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(translateX, {
        toValue: -DRAWER_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setRendered(false);
      });
    }
  }, [visible]);

  const handleTabPress = async (tab: string) => {
    if (tab === 'Logout') {
      await supabase.auth.signOut();
      onClose();
      Alert.alert('Logged out', 'You have been signed out.');
      return;
    }
    setActiveTab(tab);
  };

  if (!rendered) return null;

  const renderContent = () => {
    switch (activeTab) {
      case 'General': return <General />;
      case 'Notifications': return <Notifications />;
      case 'Activity': return <Activity />;
      case 'Help': return <Help />;
      case 'About': return <About />;
      default: return null;
    }
  };

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay} />
      </TouchableWithoutFeedback>

      <Animated.View style={[styles.drawer, { transform: [{ translateX }] }]}>
        <Text style={styles.title}>Settings</Text>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => handleTabPress(tab)}
            style={[
              styles.item,
              activeTab === tab && tab !== 'Logout' ? styles.activeItem : null,
            ]}
          >
            <Text style={styles.itemText}>{tab}</Text>
          </TouchableOpacity>
        ))}
        <View style={styles.content}>{renderContent()}</View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  drawer: {
    position: 'absolute',
    left: 0,
    top: DRAWER_TOP_OFFSET,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: '#fff',
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 10,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Prata',
    marginBottom: 16,
  },
  item: {
    paddingVertical: 10,
  },
  activeItem: {
    backgroundColor: '#e0f7fa',
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  itemText: {
    fontSize: 16,
    fontFamily: 'Prata',
  },
  content: {
    marginTop: 20,
  },
});
