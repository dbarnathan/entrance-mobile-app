import React, { useState, useContext } from 'react'
import { Text, View, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native'
import { colors, fontSize } from '../../../theme'
import { createStackNavigator } from '@react-navigation/stack'
import { useRoute, useFocusEffect, useNavigation, StackActions } from '@react-navigation/native'
import { FlagContext } from '../../../context/FlagContext'
import { HomeTitleContext } from '../../../context/HomeTitleContext'
import { ColorSchemeContext } from '../../../context/ColorSchemeContext'
import { lightProps, darkProps } from './navigationProps/navigationProps'
import { LinearGradient } from 'expo-linear-gradient'
import HeaderStyle from './headerComponents/HeaderStyle'
import Modal from 'react-native-modal'
import Home from '../../../scenes/Home'
import Detail from '../../../scenes/detail'
import Create from '../../../scenes/Create'
import Ingredients from '../../../scenes/Ingredients'
import { Feather } from '@expo/vector-icons'
import Recipe from '../../../scenes/Recipe'

const Stack = createStackNavigator()

export const CreateNavigator = () => {
  const { scheme } = useContext(ColorSchemeContext)
  const { createVisible, setCreateVisible } = useContext(FlagContext)
  const isDark = scheme === 'dark'
  const navigation = useNavigation()
  const navigationProps = scheme === 'dark' ? darkProps : lightProps
  const colorScheme = {
    content: isDark ? styles.darkContent : styles.lightContent,
    text: isDark ? colors.white : colors.primaryText
  }
  const [title, setTitle] = useState('default title')
  const [isVisible, setIsVisible] = useState(true)
  return (
    

        <Stack.Navigator

          screenOptions={{

          }}>
          <Stack.Screen
            name="NameStack"
            component={Create}
            options={{
              header: () => (
                <View style={{ paddingTop: 65, paddingLeft: 10 }}>
                  <Feather name="chevron-left" size={30} color="white" onPress={() => { navigation.goBack() }} />
                </View>
              ),
              headerStyle: {
                backgroundColor: '#343536',

              },

            }}

          />
          <Stack.Screen
            name="Guide"
            component={Ingredients}
            options={{
              headerShown: false,
              headerStyle: {
                backgroundColor: '#343536',

              },

            }}

          />
          <Stack.Screen
            name="Recipe"
            component={Recipe}
            options={{
              headerShown: false,
              headerStyle: {
                backgroundColor: '#343536',

              },

            }}

          />
        </Stack.Navigator>



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
