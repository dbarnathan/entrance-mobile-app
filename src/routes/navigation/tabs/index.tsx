import React, { useContext, useEffect } from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import FontIcon from 'react-native-vector-icons/FontAwesome5'
import { AntDesign } from '@expo/vector-icons';
import { colors } from 'theme'
import Feather from '@expo/vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import Ionicons from '@expo/vector-icons/Ionicons';

// stack navigators
import { HomeNavigator, ProfileNavigator, ConnectNavigator, } from '../stacks'

import Profile from '../../../scenes/Profile';
import { FlagContext } from '../../../context/FlagContext';
import { ClaimsNavigator } from '../stacks/ClaimsNavigator';
import { UserDataContext } from '../../../context/UserDataContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CampaignsNavigator } from '../stacks/CampaignsNavigator';
import { ContactsNavigator } from '../stacks/ContactsNavigator';
import { Pressable, TouchableOpacity } from 'react-native';

const Tab = createBottomTabNavigator()


const TabNavigator = () => {

  const { isTabVisible } = useContext(FlagContext)
  const { userRole } = useContext(UserDataContext)


  return (

    <Tab.Navigator

      defaultScreenOptions={{
        headerShown: false,
        headerTransparent: true
      }}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.lightPurple,
        tabBarInactiveTintColor: colors.gray,
        tabBarIconStyle: {
          alignItems: "flex-end",
          justifyContent: "flex-end"
        }
      })}

      initialRouteName="Profile"
      swipeEnabled={false}
    >

      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="dashboard" size={24} color={color} />


          ),
        }}
      />

      <Tab.Screen
        name="Claims"
        component={ClaimsNavigator}
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({ color, size }) => (
            <Feather name="inbox" size={24} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Home"
        component={HomeNavigator}

        options={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarIcon: ({ color, size }) => (
            <Feather name="message-circle" size={28} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Campaigns"
        component={CampaignsNavigator}
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="megaphone-outline" size={24} color={color} />
          ),
          tabBarButton: (props) => userRole == "user" ? null :  <Pressable {...props} />,
        }}
      />
      <Tab.Screen
        name="Contacts"
        component={ContactsNavigator}
        options={{
          tabBarShowLabel: false,

          tabBarIcon: ({ color, size }) => (
            <AntDesign name="contacts" size={24} color={color} />
          ),

          tabBarButton: (props) => userRole == "user" ? null : <Pressable {...props} />,
        }}
      />




    </Tab.Navigator>


  )
}

export default TabNavigator
