import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import LoginScreen from './screens/LoginScreen';
import SplashScreen from './screens/SplashScreen';
import IntroScreen from './screens/IntroScreen';
import HomeScreen from './screens/HomeScreen';
import ScanScreen from './screens/ScanScreen';
import SyncScreen from './screens/Sync';
import LogoutScreen from './screens/LogoutScreen';
import SyncInfoScreen from './screens/SyncInfoScreen';


const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name='Splash' component={SplashScreen} options={{ headerShown: false }} />
          <Stack.Screen name='Intro' component={IntroScreen} options={{ headerShown: false }} /> 
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name='Home' component={HomeScreen} options={{ headerShown: false }} />
          <Stack.Screen name='Scan' component={ScanScreen} options={( { navigation } ) => ({
            
              headerLeft: () => (
                <Icon
                  name="chevron-back"
                  size={24}
                  color="#fff"
                  style={{ marginLeft: 0, fontSize: 30 }}
                  onPress={() => navigation.goBack()}
                />
          
              ),
               headerShown: true, headerStyle: {
            backgroundColor: "#000000"
          },
          headerTitleStyle: {
            fontWeight: 400,
            color: "#ffffff"
          },
          headerTitleAlign: "center",
          headerShadowVisible: false
          })} />
          <Stack.Screen name='Sync' component={SyncScreen} options={( { navigation } ) => ({
            
            headerLeft: () => (
              <Icon
                name="chevron-back"
                size={24}
                color="#fff"
                style={{ marginLeft: 0, fontSize: 30 }}
                onPress={() => navigation.goBack()}
              />
        
            ),
             headerShown: true, headerStyle: {
          backgroundColor: "#000000"
        },
        headerTitleStyle: {
          fontWeight: 400,
          color: "#ffffff"
        },
        headerTitleAlign: "center",
        headerShadowVisible: false
        })} />

<Stack.Screen name='Sync Info' component={SyncInfoScreen} options={( { navigation } ) => ({
            
            headerLeft: () => (
              <Icon
                name="chevron-back"
                size={24}
                color="#fff"
                style={{ marginLeft: 0, fontSize: 30 }}
                onPress={() => navigation.goBack()}
              />
        
            ),
             headerShown: true, headerStyle: {
          backgroundColor: "#000000"
        },
        headerTitleStyle: {
          fontWeight: 400,
          color: "#ffffff"
        },
        headerTitleAlign: "center",
        headerShadowVisible: false
        })} />

    <Stack.Screen name='Logout' component={LogoutScreen} options={( { navigation } ) => ({
            
            headerLeft: () => (
              <Icon
                name="chevron-back"
                size={24}
                color="#fff"
                style={{ marginLeft: 0, fontSize: 30 }}
                onPress={() => navigation.goBack()}
              />
        
            ),
             headerShown: true, headerStyle: {
          backgroundColor: "#000000"
        },
        headerTitleStyle: {
          fontWeight: 400,
          color: "#ffffff"
        },
        headerTitleAlign: "center",
        headerShadowVisible: false
        })} />
        </Stack.Navigator>

        
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}


const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});