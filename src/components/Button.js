import React from "react";
import { StyleSheet, TouchableOpacity, Text, View } from "react-native";
import { fontSize, colors } from "../theme";

export default function Button(props) {
  const { label, onPress, color, disable, buttonStyle, textColor } = props

  if(disable) {
    return (
      <View
        style={[styles.button, { backgroundColor: color, opacity: 0.3 }, buttonStyle]}
      >
        <Text style={styles.buttonText}>{label}</Text>
      </View>
    )
  }
  
  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: color }, buttonStyle]}
      onPress={onPress}
    >
      <Text style={[styles.buttonText, textColor]}>{label}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 20,
    marginTop: 20,
    height: 48,
    borderRadius: 5,
    alignItems: "center",
    justifyContent: 'center'
  },
  buttonText: {
    color: colors.white,
    fontSize: fontSize.large
  },
})