import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import TaskListScreen from '../screens/TaskListScreen';
import DrawerContent from './DrawerContent';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { View } from 'react-native';
import SettingsScreen from '../screens/SettingsScreen';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => (
        <>
          <DrawerContent {...props} />
          {/* Separator below Drawer Items */}
          <View
            style={{
              height: 1,
              backgroundColor: '#ddd',
              marginVertical: 8,
              marginHorizontal: 16,
            }}
          />
        </>
      )}
      screenOptions={{
        headerShown: false,
        drawerType: 'slide',
        drawerActiveTintColor: '#5e5ce6',
        drawerInactiveTintColor: '#333',
        drawerActiveBackgroundColor: '#fff',
        drawerInactiveBackgroundColor: 'transparent',
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '500',
        },
        drawerItemStyle: {
          borderRadius: 8,
          marginHorizontal: 10,
          marginVertical: 4,
          paddingVertical: 6,
        },
        drawerPressColor: '#e3e3f3', // iOS highlight and Android ripple
      }}
    >
      <Drawer.Screen
        name="My Task"
        component={TaskListScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="clipboard-text-outline" size={size} color={color} />
          ),
        }}
      />
      <Drawer.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          drawerIcon: ({ color, size }) => (
            <MaterialCommunityIcons name="cog-outline" size={size} color={color} />
          ),
        }}
      />
    </Drawer.Navigator>
  );
}
