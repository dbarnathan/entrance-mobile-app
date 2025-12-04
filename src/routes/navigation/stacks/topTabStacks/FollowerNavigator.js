import React, { useContext } from 'react'
import { createStackNavigator } from '@react-navigation/stack'


const Stack = createStackNavigator()

export const FollowerNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={({ route, navigation }) => ({
        headerShown: false,
      })}
    >

    </Stack.Navigator>
  )
}