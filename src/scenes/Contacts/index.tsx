import React, { useEffect, useContext, useState, useRef, useCallback } from 'react'
import { Alert, FlatList, Keyboard, KeyboardAvoidingView, Platform, Pressable, SafeAreaView, ScrollView, StatusBar, Text, TextInput, TouchableWithoutFeedback, View, useWindowDimensions } from 'react-native';
import { UserDataContext } from '../../context/UserDataContext';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { doc, onSnapshot, collection, query, getDocs, setDoc, deleteDoc, orderBy, limit, getDoc } from 'firebase/firestore';
import { colors, fontSize } from '../../theme';
import styles from './styles';
import { useNavigation, useRoute } from '@react-navigation/native';

import { AntDesign, Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import TimeAgo from 'react-native-timeago';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { EditContactModal } from '../../components/EditContactModal';

const formatPhoneNumber = (e) => {
  let formattedNumber;
  const length = e.length;
  // Filter non numbers
  const regex = () => e.replace(/[^0-9\.]+/g, "");
  // Set area code with parenthesis around it
  const areaCode = () => `(${regex().slice(0, 3)})`;

  // Set formatting for first six digits
  const firstSix = () => `${areaCode()} ${regex().slice(3, 6)}`;

  // Dynamic trail as user types
  const trailer = (start) => `${regex().slice(start,
    regex().length)}`;
  if (length < 3) {
    // First 3 digits
    formattedNumber = regex();
  } else if (length === 4) {
    // After area code
    formattedNumber = `${areaCode()} ${trailer(3)}`;
  } else if (length === 5) {
    // When deleting digits inside parenthesis
    formattedNumber = `${areaCode().replace(")", "")}`;
  } else if (length > 5 && length < 9) {
    // Before dash
    formattedNumber = `${areaCode()} ${trailer(3)}`;
  } else if (length >= 10) {
    // After dash
    formattedNumber = `${firstSix()}-${trailer(6)}`;
  }


  return formattedNumber

};

export default function Contacts() {
  const route = useRoute()
  const { setUserData, userData } = useContext(UserDataContext)
  const navigation = useNavigation()
  const [messages, setMessages] = useState(["1", "2", "3", "4", "5", "6"])

  const [showSend, setShowSend] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [metaData, setMetaData] = useState({})
  const [showContact, setShowContact] = useState(false)
  const [currentMeta, setCurentMeta] = useState({})
  const [newMessage, setNewMessage] = useState("")
  const [contactId, setContactId] = useState("")
  const textRef = useRef(null)
  const messageRef = useRef(null)

  const { data } = route.params




  const options = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };


  const deviceWidth = useWindowDimensions().width
  const deviceHeight = useWindowDimensions().height

  useEffect(() => {
    console.log("Data: ", data)
    axios.get(`https://${process.env.EXPO_PUBLIC_LIVE}/channels/${data.id}`, {
      headers: {
        'Authorization': userData.access_token
      }
    }).then((response) => {
      console.log("response: ", response.data.record)
      setMetaData(response.data.record.contact)
      setNewMessage(response.data.record.contact.notes)
      setContactId(response.data.record.contact.id)

    }).catch((err) => {
      console.log(err.toJSON());

    })
  }, [setShowContact])

  const handleEdit = (key, value) => {
    console.log("Key: ", key, " Value: ", value)
    setCurentMeta([key, value])
    setShowContact(true)
  }

  const deleteMetaData = (key) => {

  }

  const handleUpdateNotes = () => {
    console.log("Update: ", newMessage)
    const config = {
      method: 'patch',
      url: `https://${process.env.EXPO_PUBLIC_LIVE}/contacts/${data.id}`,
      headers: { 
        'Content-Type': 'application/json', 
        'Authorization': userData.access_token
      },
      data: {
        notes: newMessage
      }
    };

    axios.patch(`https://${process.env.EXPO_PUBLIC_LIVE}/contacts/${contactId}`, {notes: newMessage}, {headers: { 'Authorization': userData.access_token}}).then((response) => {
      console.log("response META: ", response.data.record)
      // setMetaData(response.data.record.contact.meta)
      // setNewMessage(response.data.record.contact.notes)
      Alert.alert(`Contact has been updated`, '', [
        { text: 'OK', onPress: () => console.log("Updated") },
    ]);

    }).catch((err) => {
      console.log(err.response, " :ERROR ADDING NOTES");

    })
  }


  const handleDelete = (key) => {
    Alert.alert(`Are you sure you would like to delete the ${key}?`, '', [
      { text: 'no', onPress: () => console.log('OK Pressed') },
      { text: 'yes', onPress: () => deleteMetaData(key) },

    ]);
  }



  return (

    <View style={{ justifyContent: "space-between", height: "100%" }} >
      <EditContactModal isVisible={showContact} setIsVisible={setShowContact} item={currentMeta} id={contactId}/>

      <View style={{ padding: 12, justifyContent: "space-between", flexDirection: "row", backgroundColor: "white", }}>

        <View style={{ flexDirection: "row", gap: 5, padding: 8, paddingTop: 0 }}>
          <Pressable style={{ position: "absolute", height: 70, width: 90, top: -15, left: -15, zIndex: 3 }} onPress={() => { navigation.goBack() }}></Pressable>

          <FontAwesome5 name="chevron-left" size={22} color="black" />


        </View>
        <View>
          <Text style={{ fontWeight: "500", fontSize: 15 }}>Contact Meta Data</Text>
        </View>
        <View>
          <Text>+1 {formatPhoneNumber(data.number.slice(1))}</Text>
        </View>

      </View>



      <ScrollView style={{ flex: 1, height: "100%", gap: 12, padding: 16 }} keyboardShouldPersistTaps="handled">
        <View style={{ borderRadius: 12, backgroundColor: "white", padding: 12, marginBottom: 13 }}>
          <Text style={{ fontWeight: "600", fontSize: 15 }}>Channel Id</Text>
          <Text style={{ color: "gray" }}>{data.id}</Text>
        </View>
        <View style={{ borderRadius: 12, backgroundColor: "white", padding: 12, marginBottom: 13 }}>
          <Text style={{ fontWeight: "600", fontSize: 15 }}>Start Date</Text>
          <Text style={{ color: "gray" }}>{new Date(data.created_at).toLocaleDateString("en-US", options)}</Text>
        </View>
        <View style={{ backgroundColor: "white", padding: 20, paddingBottom: 35, flexDirection: "column", gap: 12, borderRadius: 12, marginBottom: 13 }}>
          <Text style={{ fontWeight: "500", fontSize: 15 }}>Notes</Text>
          <TextInput
            style={{ backgroundColor: colors.lightGrayPurple, color: "black", borderRadius: 12, fontSize: 16, padding: 12, borderColor: "#7972BC", borderWidth: 1, minWidth: "80%", marginBottom: 5 }}
            placeholderTextColor={"gray"}
            ref={textRef}
            multiline
            placeholder={"Type your note \nhere in this field..."}

            onChangeText={(value) => setNewMessage(value)}
            value={newMessage}


          />

          <Pressable style={styles.button} onPress={() => { handleUpdateNotes() }}>
            <Text style={{ color: "white", fontSize: 16 }}>Save</Text>

          </Pressable>

        </View>
        <View style={{ borderRadius: 12, backgroundColor: "white", padding: 12, marginBottom: 35, flexDirection: "column", gap: 7 }}>
          <Text style={{ fontWeight: "600", fontSize: 15, paddingBottom: 10 }}>Other Meta Data</Text>
          {
            metaData != undefined &&
            Object.entries(metaData?.meta == undefined ? {} : metaData?.meta).map(([key, value]) => (

              <Pressable style={{ flexDirection: "row", justifyContent: "space-between", paddingBottom: 5, flex: 1, }} onLongPress={() => handleDelete(key)}>
                <View>
                  <Text style={{ color: "gray" }}>{key}: </Text>
                  <Text style={{ fontWeight: "500", fontSize: 15 }}>{value?.toString()}</Text>
                </View>



                <View style={{ backgroundColor: "#58bf61", alignItems: "center", justifyContent: 'center', padding: 12, borderRadius: 12 }}>
                  <Pressable style={{ position: "absolute", height: 60, width: 60, zIndex: 3, }} onPress={() => { handleEdit(key, value) }}></Pressable>
                  <FontAwesome5 name="edit" size={14} color="white" />
                </View>


              </Pressable>

            ))

          }

        </View>
      </ScrollView>



    </View >

  )
}