import React, { useState, useContext } from "react";
import { createStackNavigator } from '@react-navigation/stack'
import { HomeTitleContext } from "../../../../context/HomeTitleContext";

import Post from "../../../../scenes/post";
import Print from "../../../../scenes/print";
import Create from "../../../../scenes/Create";
import Otheruser from "../../../../scenes/Otheruser";
import Dm from "../../../../scenes/Dm";

const Stack = createStackNavigator()

export const ModalStacks = () => {
  const [title, setTitle] = useState('default title')

  return (
    <HomeTitleContext.Provider
      value={{
        title,
        setTitle,
      }}
    >
      <HomeTitleContext.Consumer>
        {(ctx) => (
          <Stack.Navigator
            screenOptions={{
              headerShown: true,
            }}
          >
            <Stack.Screen
              name='Create'
              component={Create}
              options={{
                title: ctx.title,
                headerBackTitle: '',
              }}
            />
            <Stack.Screen
              name='Post'
              component={Post}
              options={{
                title: ctx.title,
                headerBackTitle: '',
              }}
            />
            <Stack.Screen
              name='Other-User'
              component={Otheruser}
              options={{
                headerShown: false,
            
                headerBackTitle: '',
              }}
            />
             <Stack.Screen
              name='DirectMessage'
              component={Dm}
              options={{
                headerShown: false,
            
                headerBackTitle: '',
              }}
            />

            <Stack.Screen
              name='Print'
              component={Print}
            />
          </Stack.Navigator>
        )}
      </HomeTitleContext.Consumer>
    </HomeTitleContext.Provider>
  )
}