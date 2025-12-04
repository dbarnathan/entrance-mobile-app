import React, { useContext } from 'react'
import Main from './navigation'
import Initial from "../scenes/Initial"
import { useEffect, useState } from 'react'
import { UserDataContext } from '../context/UserDataContext'
import { socket, Authenticate } from "../sockets/socket"

const Routes = () => {

  const [checked, setChecked] = useState(false)


  useEffect(() => {
    setTimeout(() => {
      setChecked(true)
    }, 1000)
  }, [])


  // rendering
  if (!checked) {
    return <Initial />
  }

  return <Main />
}

export default Routes
