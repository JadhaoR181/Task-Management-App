import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function OnboardingScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Get things done.</Text>
      <Text style={styles.subtitle}>Just a click away from planning your tasks.</Text>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Login')}>
        <MaterialIcons name="arrow-forward-ios" size={24} color="white" />
      </TouchableOpacity>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, alignItems: 'center', backgroundColor: '#6C63FF' },
  title: { fontSize: 28, fontWeight: 'bold', color: 'white', marginBottom: 10 },
  subtitle: { fontSize: 16, color: 'white', textAlign: 'center', marginBottom: 30 },
  button: { backgroundColor: '#4439e6', borderRadius: 50, padding: 20 },
});
