import React, { createContext, useState, useEffect } from 'react'
import { doc, onSnapshot, collection, query, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';

export const FlagContext = createContext();

export const FlagContextProvider = (props) => {
  const [rerender, setRerender] = useState(false)
  const [createVisible, setCreateVisible] = useState(false)
  const [deepLink, setDeepLink] = useState("")
  const [isTabVisible, setIsTabVisible] = useState(true)


  return (
    <FlagContext.Provider
      value={{
        rerender, setRerender, createVisible, setCreateVisible, deepLink, setDeepLink, isTabVisible, setIsTabVisible
      }}
    >
      {props.children}
    </FlagContext.Provider>
  )
}