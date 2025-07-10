// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/auth/LoginScreen';
import SignupScreen from './src/auth/SignupScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import AddTaskScreen from './src/screens/AddTaskScreen';
import EditTaskScreen from './src/screens/EditTaskScreen';
import { PaperProvider } from 'react-native-paper';
import DrawerNavigator from './src/navigation/DrawerNavigator';
import SettingsScreen from './src/screens/SettingsScreen';


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Onboarding">
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="Dashboard" component={DrawerNavigator} />
          <Stack.Screen name="AddTask" component={AddTaskScreen}/>
          <Stack.Screen name="EditTask" component={EditTaskScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen}/>
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
