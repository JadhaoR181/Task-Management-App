import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, TextInput, Button } from 'react-native-paper';
import { login } from '../services/authService';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    try {
      await login(email, password);
      Alert.alert("Success", "Logged in!");
      navigation.reset({
  index: 0,
  routes: [{ name: 'Dashboard' }],
});

    } catch (error: any) {
      Alert.alert("Login Failed", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Welcome back!</Text>

      <TextInput label="Email" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput label="Password" value={password} onChangeText={setPassword} secureTextEntry style={styles.input} />

      <Button mode="contained" style={styles.button} onPress={handleLogin}>Log In</Button>

      <Text style={styles.switchText}>
        Don’t have an account? <Text style={{color:"#5e5cef"}} onPress={() => navigation.navigate('Signup')}>Get started!</Text>
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20 },
  title: { marginBottom: 20, textAlign: 'center' },
  input: { marginBottom: 10 },
  button: { marginVertical: 20 , color: "#5e5cef"},
  switchText: { textAlign: 'center' },
});
