import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { signUp, saveUserInfo } from '../services/authService';

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = async () => {
    try {
      const userCredential = await signUp(email, password);
      const userId = userCredential.user.uid;

      // ✅ Save name and email to Firestore (NOT password)
      await saveUserInfo(userId, name, email);

      Alert.alert("Success", "Account created!");
     navigation.reset({
  index: 0,
  routes: [{ name: 'Dashboard' }],
});
  
    } catch (error: any) {
      Alert.alert("Error", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Let's get started!</Text>

      <TextInput
        label="Name"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <Button mode="contained" style={styles.button} onPress={handleSignup}>
        Sign Up
      </Button>

      <Text style={styles.switchText}>
        Already have an account? <Text onPress={() => navigation.navigate('Login')}>Log in</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { marginBottom: 20, textAlign: 'center' },
  input: { marginBottom: 10 },
  button: { marginVertical: 20 },
  switchText: { textAlign: 'center' },
});
