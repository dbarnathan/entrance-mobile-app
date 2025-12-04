import React, { useState, useContext, useEffect } from 'react'
import { Text, View, StyleSheet, SafeAreaView, Platform } from 'react-native'
import { colors, fontSize } from '../../../theme'
import { createStackNavigator } from '@react-navigation/stack'
import { NavigationContainer, useNavigation } from '@react-navigation/native'
import { HomeTitleContext } from '../../../context/HomeTitleContext'
import { ColorSchemeContext } from '../../../context/ColorSchemeContext'
import { lightProps, darkProps } from './navigationProps/navigationProps'
import { createMaterialBottomTabNavigator } from 'react-native-paper/lib/typescript/react-navigation'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'
import * as Linking from 'expo-linking'
import { DefaultTheme, DarkTheme } from '@react-navigation/native'
import Home from '../../../scenes/Home'
import { StatusBar } from 'react-native'
import Message from '../../../scenes/Message'
import { FlagContext } from '../../../context/FlagContext'
import Contacts from '../../../scenes/Contacts'

export const HomeNavigator = () => {
  const Stack = createStackNavigator()
  const TopTab = createMaterialTopTabNavigator()
  const navigation = useNavigation()

  const { scheme } = useContext(ColorSchemeContext)
  const {isTabVisible, setIsTabVisible } = useContext(FlagContext)
  const isDark = scheme === 'dark'
  const navigationProps = scheme === 'dark' ? darkProps : lightProps
  const colorScheme = {
    content: isDark ? styles.darkContent : styles.lightContent,
    text: isDark ? colors.white : colors.primaryText
  }

  const [title, setTitle] = useState('default title')




  return (
    <>
      {
        Platform.OS === "ios" ?
          <SafeAreaView style={Platform.OS == "ios" ? { flex: .01, backgroundColor: "white" } : { flex: 0.06 }}>
            <StatusBar barStyle="dark-content" backgroundColor="white" />
          </SafeAreaView> : <StatusBar barStyle="dark-content" backgroundColor="white" />
      }

      <HomeTitleContext.Provider

        value={{
          title,
          setTitle,
        }}

      >
        <HomeTitleContext.Consumer>
          {(ctx) => (

            <Stack.Navigator>
              <Stack.Screen
                name="HomeStack"
                component={Home}

                options={() => ({
                  headerShown: false
                })}
              />
              <Stack.Screen
                name="MessageStack"
                component={Message}

                options={() => ({
                  headerShown: false
                })}
              />
                 <Stack.Screen
                name="ContactStack"
                component={Contacts}

                options={() => ({
                  headerShown: false
                })}
              />

            </Stack.Navigator>

          )
          }
        </HomeTitleContext.Consumer >
      </HomeTitleContext.Provider >
    </>

  )
}


const styles = StyleSheet.create({
  lightContent: {
    backgroundColor: colors.lightyellow,
    padding: 20,
    borderRadius: 5,
    marginTop: 30,
    marginLeft: 30,
    marginRight: 30,
  },
  darkContent: {
    backgroundColor: colors.gray,
    padding: 20,
    borderRadius: 5,
    marginTop: 30,
    marginLeft: 30,
    marginRight: 30,
  },
  main: {
    flex: 1,
    width: '100%',
  },
  title: {
    fontSize: fontSize.middle,
    marginBottom: 20,
    textAlign: 'center'
  },
  contents: {
    fontSize: fontSize.small,
  },
  field: {
    fontSize: fontSize.middle,
    textAlign: 'center',
  },
  send: {
    position: "absolute",
    height: 60,
    width: 60,
    borderRadius: 30,
    backgroundColor: "#3686EF",
    justifyContent: 'center',
    zIndex: 200,

    right: 30,

    shadowColor: "#000000",
    shadowOpacity: 0.3033,
    shadowRadius: 2.5,
    shadowOffset: {
      height: 3,
      width: 1
    },
    elevation: 5,
  },
})
