import React from 'react';
import {DarkTheme, NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import CustomerDashboardScreen from '../screens/CustomerDashboardScreen';
import MerchantDashboardScreen from '../screens/MerchantDashboardScreen';
import MerchantQrScreen from '../screens/MerchantQrScreen';
import RoleSelectionScreen from '../screens/RoleSelectionScreen';
import ScanAndPayScreen from '../screens/ScanAndPayScreen';
import SplashScreen from '../screens/SplashScreen';
import {colors} from '../theme';
import type {RootStackParamList} from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: colors.background,
    card: colors.background,
    border: colors.border,
    primary: colors.primary,
    text: colors.textPrimary,
  },
};

export default function RootNavigator() {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerStyle: {backgroundColor: colors.background},
          headerTintColor: colors.textPrimary,
          headerShadowVisible: false,
          contentStyle: {backgroundColor: colors.background},
        }}>
        <Stack.Screen
          name="Splash"
          component={SplashScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="RoleSelection"
          component={RoleSelectionScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="CustomerDashboard"
          component={CustomerDashboardScreen}
          options={{title: 'Customer'}}
        />
        <Stack.Screen
          name="ScanAndPay"
          component={ScanAndPayScreen}
          options={{title: 'Scan & Pay'}}
        />
        <Stack.Screen
          name="MerchantDashboard"
          component={MerchantDashboardScreen}
          options={{title: 'Merchant'}}
        />
        <Stack.Screen
          name="MerchantQr"
          component={MerchantQrScreen}
          options={{title: 'Merchant QR'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
