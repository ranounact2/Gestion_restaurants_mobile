import React from 'react';
import { Provider } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { ThemeProvider } from './src/contexts/ThemeContext';
import store from './src/store/store';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }} pointerEvents="auto">
      <Provider store={store}>
        <ThemeProvider>
          <SafeAreaProvider>
            <NavigationContainer>
              <StatusBar style="auto" />
              <AppNavigator />
            </NavigationContainer>
          </SafeAreaProvider>
        </ThemeProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}
