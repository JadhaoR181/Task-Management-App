import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import { Text, Avatar } from 'react-native-paper';
import { auth, db } from '../services/firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { logout } from '../services/authService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DrawerContent(props: any) {
  const [userInitial, setUserInitial] = useState('U');
  const [userName, setUserName] = useState('User');
  const { state, navigation } = props;
  const currentRoute = state.routeNames[state.index];

  const fetchUserName = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const name = docSnap.data().name;
          setUserName(name);
          setUserInitial(name?.charAt(0)?.toUpperCase() || 'U');
        }
      }
    } catch (error) {
      console.error('Error fetching user name:', error);
    }
  };

  useEffect(() => {
    fetchUserName();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      props.navigation.replace('Login');
    } catch (err) {
      console.log('Logout error:', err);
    }
  };

  return (
   <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
  {/* Fixed Header: stays above the scroll view */}
  <View style={styles.header}>
    <Avatar.Text size={48} label={userInitial} style={styles.avatar} />
    <Text style={styles.userName}>{userName}</Text>
    <Text style={styles.email}>{auth.currentUser?.email}</Text>
  </View>

  {/* Scrollable Items */}
  <DrawerContentScrollView {...props} contentContainerStyle={{ paddingTop: 0 }}>
    <View style={styles.drawerItemsContainer}>
      <DrawerItem
        label="My Task"
        focused={currentRoute === 'My Task'}
        onPress={() => navigation.navigate('My Task')}
        labelStyle={[
          styles.drawerLabel,
          currentRoute === 'My Task' && styles.activeLabel,
        ]}
        icon={({ color, size }) => (
          <MaterialCommunityIcons
            name="clipboard-text-outline"
            color={currentRoute === 'My Task' ? '#5e5ce6' : color}
            size={size}
          />
        )}
        style={currentRoute === 'My Task' ? styles.activeItem : styles.inactiveItem}
        pressColor="#eee"
        pressOpacity={Platform.OS === 'ios' ? 0.3 : 1}
      />
      <View style={styles.separator} />

      <DrawerItem
        label="Settings"
        focused={currentRoute === 'Settings'}
        onPress={() => navigation.navigate('Settings')}
        labelStyle={[
          styles.drawerLabel,
          currentRoute === 'Settings' && styles.activeLabel,
        ]}
        icon={({ color, size }) => (
          <MaterialCommunityIcons
            name="cog-outline"
            color={currentRoute === 'Settings' ? '#5e5ce6' : color}
            size={size}
          />
        )}
        style={currentRoute === 'Settings' ? styles.activeItem : styles.inactiveItem}
        pressColor="#eee"
        pressOpacity={Platform.OS === 'ios' ? 0.3 : 1}
      />
      <View style={styles.separator} />
    </View>
  </DrawerContentScrollView>

  {/* Logout Button at Bottom */}
  <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
    <Text style={styles.logoutText}>Logout</Text>
    
  </TouchableOpacity>
</SafeAreaView>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
header: {
  alignItems: 'center',
  paddingTop: Platform.OS === 'android' ? 30 : 50, // Respect status bar
  paddingBottom: 20,
  borderBottomWidth: 1,
  borderBottomColor: '#eee',
  backgroundColor: '#fff',
  shadowColor: '#000',
  shadowOpacity: 0.05,
  shadowRadius: 5,
  elevation: 2,
},

  avatar: {
    backgroundColor: '#ccc',
  },
  userName: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  email: {
    fontSize: 14,
    color: '#777',
  },
  drawerItemsContainer: {
    paddingTop: 10,
  },
  drawerLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginHorizontal: 15,
  },
  activeLabel: {
    color: '#5e5ce6',
    fontWeight: '600',
  },
  activeItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 10,
    paddingVertical: 2,
  },
  inactiveItem: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    marginHorizontal: 10,
    paddingVertical: 2,
  },
  logoutButton: {
    borderTopWidth: 1,
    borderTopColor: '#eee',
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 20, // Extra margin at bottom
  },
  logoutText: {
    color: '#e53935',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 16,
  },
});
