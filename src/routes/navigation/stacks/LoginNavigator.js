import React, { useContext } from 'react'
import { Platform, SafeAreaView } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'
import { ColorSchemeContext } from '../../../context/ColorSchemeContext'
import { lightProps, darkProps } from './navigationProps/navigationProps'
import { StatusBar } from 'expo-status-bar';
import HeaderStyle from './headerComponents/HeaderStyle'

import Login from '../../../scenes/Login'
import Opening from '../../../scenes/Opening'

const Stack = createStackNavigator()

export const LoginNavigator = () => {
  const { scheme } = useContext(ColorSchemeContext)
  const navigationProps = scheme === 'light' ? darkProps : lightProps
  return (
    <>
     

      <Stack.Navigator >


        <Stack.Screen
          name="Opening"
          component={Opening}

          options={({ navigation }) => ({

            headerShown: false,
          })}

        />
        <Stack.Screen
          name="Login"
          component={Login}

          options={({ navigation }) => ({

            headerShown: false,
          })}

        />

      </Stack.Navigator>
    </>
  )
}