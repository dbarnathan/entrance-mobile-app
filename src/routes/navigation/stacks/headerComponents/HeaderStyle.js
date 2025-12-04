import React from 'react'
import { LinearGradient } from 'expo-linear-gradient'

const HeaderStyle = () => (
  <LinearGradient
    colors={['#e2e2e2', '#ffffff']}
    style={{ flex: 1 }}
    start={{x: 0, y: 0}}
    end={{x: 1, y: 0}}
  />
)

export default HeaderStyle