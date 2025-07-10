import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Switch,
  ScrollView,
  Platform,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Text, List, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const navigation = useNavigation();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Custom Back Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.separator} />

        <List.Section>
          <Text style={styles.sectionTitle}>Account</Text>
          <List.Item title="Edit Profile" left={() => <List.Icon icon="account-edit" />} onPress={() => {}} />
          <List.Item title="Change Password" left={() => <List.Icon icon="lock" />} onPress={() => {}} />
        </List.Section>

        <Divider />

        <List.Section>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <List.Item
            title="Notifications"
            left={() => <List.Icon icon="bell-outline" />}
            right={() => (
              <Switch value={notificationsEnabled} onValueChange={setNotificationsEnabled} />
            )}
          />
          <List.Item
            title="Dark Mode"
            left={() => <List.Icon icon="theme-light-dark" />}
            right={() => (
              <Switch value={darkMode} onValueChange={setDarkMode} />
            )}
          />
        </List.Section>

        <Divider />

        <List.Section>
          <Text style={styles.sectionTitle}>About</Text>
          <List.Item title="App Version" description="1.0.0" left={() => <List.Icon icon="information-outline" />} />
          <List.Item title="Privacy Policy" left={() => <List.Icon icon="file-document-outline" />} onPress={() => {}} />
        </List.Section>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
   safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.select({
      android: StatusBar.currentHeight,
      ios: 0, // iOS has SafeAreaView built-in
      default: 0,
    }),
  },
  safeContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 20,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginLeft: 12,
    color: '#333',
  },
  container: {
    padding: 16,
    paddingBottom: 24,
  },
  heading: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#888',
    marginBottom: 8,
    marginTop: 12,
    marginLeft: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginHorizontal: 15,
  },
});
