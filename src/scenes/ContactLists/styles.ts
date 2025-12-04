import { Text, View, StyleSheet } from "react-native";

import { colors, fontSize } from '../../theme';

const styles = StyleSheet.create({
  
    main: {
      backgroundColor: colors.primary,
      flex: 1
    },
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    title: {
      fontSize: fontSize.xLarge,
      fontWeight: "500"
    
    },
    contactList: {
      flex: 1,
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'flex-start',
      alignItems: "center"
    },
    button: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 8,
      paddingHorizontal: 20,
      borderRadius: 12,
      elevation: 3,
      backgroundColor: '#f36666',
    },
    subTitle: {
      fontSize: fontSize.small,
      color: "#0C2F17",

    },
    ingredient: {
      fontSize: fontSize.medium,
      fontWeight: "600"
    
    },
    ingredients: {
      paddingVertical: 16
    },
    field: {
      fontSize: fontSize.middle,
      textAlign: 'center',
    },
    info: {
      padding: 16,
      paddingHorizontal: 25,
      paddingTop: 22,
      
    
    },
    tag: {
      fontSize: fontSize.xLarge,
      fontWeight: "600",
    
  
    },
    tagElement: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: colors.tertiary,
      borderRadius: 22,
      marginLeft: 5

    },
    description: {
      fontSize: 16,
      fontWeight: "500",
      lineHeight: 27
    },
    contents: {
      fontSize: fontSize.middle,
      fontWeight: "700",
      color: colors.black
  },
  name: {
    fontSize: fontSize.xxLarge,
    fontWeight: "700"
  },
  share: {
    backgroundColor: colors.lightGrayPurple, 
    paddingHorizontal: 11, 
    paddingVertical: 10,
    borderRadius: 57,
    justifyContent: "center"
  },
  likeButton: {
    gap: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 16,
    backgroundColor: colors.tertiary,
    padding: 12,
    height: 50
  },
  comment: {
     position: "absolute", 
    height: 65, 
    width: 65, 
    backgroundColor: colors.primary, 
    borderRadius: 34, 
    bottom: 130, 
    right: 30, 
    alignItems: "center", 
    justifyContent: "center",
    shadowColor: colors.dark,
    // shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.7,
    shadowRadius: 20,
   
  },
  verticleLine:{

    height: "70%",
    width: 1.2,
    backgroundColor: '#909090',
  },
  })
  

export default styles
