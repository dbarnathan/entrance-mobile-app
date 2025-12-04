import React, { useState, useContext, useEffect } from "react";

import { createStackNavigator, TransitionPresets } from '@react-navigation/stack'

import * as Notifications from 'expo-notifications'

import { DefaultTheme, DarkTheme, NavigationContainer } from '@react-navigation/native'



const Stack = createStackNavigator()

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function RootStack() {
 

 

  return (
    <NavigationContainer  independent={true} theme={scheme === 'dark' ? DarkTheme : DefaultTheme} >
    
   
    </NavigationContainer>
  )
}