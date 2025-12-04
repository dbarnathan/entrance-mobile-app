import React, { useState, useContext } from 'react'
import { Text, View, StyleSheet, SafeAreaView, TouchableOpacity, Platform, StatusBar } from 'react-native'
import { colors, fontSize } from '../../../theme'
import { createStackNavigator } from '@react-navigation/stack'
import { useRoute, useFocusEffect, useNavigation, StackActions } from '@react-navigation/native'
import { FlagContext } from '../../../context/FlagContext'
import { ColorSchemeContext } from '../../../context/ColorSchemeContext'
import { lightProps, darkProps } from './navigationProps/navigationProps'
import Campaigns from '../../../scenes/Campaigns'
import CreateCampaign from '../../../scenes/CreateCampaign'
import ViewCampaign from '../../../scenes/ViewCampaign'
import ContactLists from '../../../scenes/ContactLists'
import GetContactList from '../../../scenes/GetContactList'


const Stack = createStackNavigator()

export const CampaignsNavigator = () => {
  const { scheme } = useContext(ColorSchemeContext)
  const { createVisible, setCreateVisible } = useContext(FlagContext)
  const isDark = scheme === 'dark'
  const navigation = useNavigation()
  const [title, setTitle] = useState('default title')
  const [isVisible, setIsVisible] = useState(true)
  return (
    <>
      {
        Platform.OS === "ios" ?
          <SafeAreaView style={Platform.OS == "ios" ? { flex: .01, backgroundColor: "white" } : { flex: 0.06 }}>
            <StatusBar barStyle="dark-content" backgroundColor="white" />
          </SafeAreaView> : <StatusBar barStyle="dark-content" backgroundColor="white" />
      }


      <Stack.Navigator

        screenOptions={{

        }}>
        <Stack.Screen
          name="CampaignsStack"
          component={Campaigns}
          options={() => ({
            headerShown: false
          })}

        />
        <Stack.Screen
          name="CreateStack"
          component={CreateCampaign}
          options={() => ({
            headerShown: false
          })}

        />
        <Stack.Screen
          name="ViewCampaign"
          component={ViewCampaign}
          options={() => ({
            headerShown: false
          })}

        />
         <Stack.Screen
          name="GetContactLists"
          component={GetContactList}
          options={() => ({
            headerShown: false
          })}

        />
        

      </Stack.Navigator>
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
