
import { MD3LightTheme as DefaultTheme } from 'react-native-paper';

export const LightTheme = {
  ...DefaultTheme,
  dark: false,
  colors: {
    ...DefaultTheme.colors,
    primary: '#5e5ce6',
    background: '#ffffff',
    text: '#333333',
    // add other color overrides if needed
  },
};
