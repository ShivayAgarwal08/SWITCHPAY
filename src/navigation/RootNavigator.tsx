import React from 'react';
import {DarkTheme, NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import WalletDashboardScreen from '../screens/WalletDashboardScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import ScanAndPayScreen from '../screens/ScanAndPayScreen';
import MyQrScreen from '../screens/MyQrScreen';
import TransactionsScreen from '../screens/TransactionsScreen';
import SplashScreen from '../screens/SplashScreen';
import PaymentResultScreen from '../screens/PaymentResultScreen';
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
          name="Onboarding"
          component={OnboardingScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="WalletDashboard"
          component={WalletDashboardScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="ScanAndPay"
          component={ScanAndPayScreen}
          options={{title: 'Scan & Pay'}}
        />
        <Stack.Screen
          name="MyQr"
          component={MyQrScreen}
          options={{title: 'My QR'}}
        />
        <Stack.Screen
          name="Transactions"
          component={TransactionsScreen}
          options={{title: 'Transactions'}}
        />
        <Stack.Screen
          name="PaymentResult"
          component={PaymentResultScreen}
          options={{title: 'Payment Result'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
