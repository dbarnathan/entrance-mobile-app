import React, { useState, useEffect } from 'react'
import { View } from 'react-native'
import { Provider } from 'jotai'
import 'utils/ignore'
import { ColorSchemeContextProvider } from './context/ColorSchemeContext'
import { UserDataContextProvider } from './context/UserDataContext'
import { FlagContextProvider } from './context/FlagContext'
import { PermissionsAndroid, Platform } from 'react-native';
// assets
import { imageAssets } from 'theme/images'
import { fontAssets } from 'theme/fonts'
import Router from './routes'
import { GestureHandlerRootView } from 'react-native-gesture-handler'

const isHermes = () => !!global.HermesInternal;


const App = () => {


  useEffect(() => {
    const run = async () => {
      if (Platform.OS === 'android') {
        await PermissionsAndroid.requestMultiple([
          'android.permission.POST_NOTIFICATIONS',
          'android.permission.BLUETOOTH_CONNECT',
        ]);
      }
    };
    run();
  }, []);

  const myTest = (data) => {
    console.log("DATA FROM WEBSOCET: ", data)
  }

  // state
  const [didLoad, setDidLoad] = useState(false)
  console.log('isHermes', isHermes())

  // handler
  const handleLoadAssets = async () => {
    // assets preloading
    await Promise.all([...imageAssets, ...fontAssets])
    setDidLoad(true)
  }

  // lifecycle
  useEffect(() => {
    handleLoadAssets()
  }, [])

  // rendering
  if (!didLoad) return <View />
  return (
    <Provider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ColorSchemeContextProvider>
          <UserDataContextProvider>
            <FlagContextProvider>
              
              <Router />
            </FlagContextProvider>
          </UserDataContextProvider>
        </ColorSchemeContextProvider>
      </GestureHandlerRootView>
    </Provider>
  )
}

export default App
