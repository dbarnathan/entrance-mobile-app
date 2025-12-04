import React, { useEffect, useCallback, useMemo, useRef, useState, useContext } from "react"
import { View, Text, Pressable, ScrollView, TouchableOpacity, useWindowDimensions, TextInput, Animated, Image, Share, DeviceEventEmitter, StyleSheet, Switch, KeyboardAvoidingView, FlatList, Alert } from 'react-native';
import { UserDataContext } from "../context/UserDataContext";
import Modal from "react-native-modal";
import colors from "../theme/colors";
import axios from "axios";
import { Entypo, Feather, FontAwesome5 } from "@expo/vector-icons";
import Toast from "react-native-toast-message";

const formatPhoneNumber = (e) => {
  let formattedNumber;
  const length = e?.length;

  // Filter non numbers
  const regex = () => e.replace(/[^0-9\.]+/g, "");
  // Set area code with parenthesis around it
  const areaCode = () => `(${regex().slice(0, 3)})`;

  // Set formatting for first six digits
  const firstSix = () => `${areaCode()} ${regex().slice(3, 6)}`;

  // Dynamic trail as user types
  const trailer = (start) => `${regex().slice(start,
    regex()?.length)}`;
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

export const ShowAllContactsModal = (props) => {
  const { isVisible, setIsVisible, item, id, campaignName } = props

  const { userData, getContacts } = useContext(UserDataContext)
  const [flagList, setFlagList] = useState([])
  const [input, setInput] = useState(item[1])

  const [contacts, setContacts] = useState([])

  const deviceHeight = useWindowDimensions().height

  const deviceWidth = useWindowDimensions().width

  useEffect(() => {
    setInput(item[1])
    console.log("Contact ID: ", item.id)
  }, [isVisible])

  useEffect(() => {
    if (Array.isArray(item)) {
      let temp = []
      item.forEach((ele) => {
        let obj = {}
        obj = ele
        temp.push({meta: obj})
      })
      
      console.log("Meta: ", temp)

      setContacts(temp)
    } else {
      axios.get(`https://${process.env.EXPO_PUBLIC_LIVE}/contact-lists/${item.id}/contacts?lastId=0&order=ASC&limit=100`, {
        headers: {
          'Authorization': userData.access_token
        },
      }).then((response) => {
        console.log(response.data.records, "  : CONTACT")
        let sort = response.data.records

        setContacts(sort)


      }).catch((err) => {
        console.log("CONTACTS ERROR: ", err.toJSON());

      })
    }

  }, [])

  const Contact = ({ item }) => {
    // console.log("Campaign Component: ", item)

    const [id, setId] = useState("")
    const [isStopped, setIsStopped] = useState(item.stop)
    const [isArchived, setIsArchived] = useState(item.archive)
    const [isExtra, setIsExtra] = useState(false)

    useEffect(() => {
      console.log("CONTACT FROM TAB: ", item)
    }, [])

    const handleStopped = () => {
      const config = {
        method: 'patch',
        url: `https://${process.env.EXPO_PUBLIC_LIVE}/contacts/${item.id}`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': userData.access_token
        },
        data: {
          stop: !isStopped
        }
      };

      axios(config).then(async (response) => {
        console.log(response.data.record, " : Contacts List Data")
        setIsStopped(!isStopped)
        Toast.show({
          type: 'success',
          text2: `Campaign ${item.number} has been ${isStopped ? 'un-stopped' : 'stopped'}`
        });

        getContacts()
        // Alert.alert(`Campaign ${item.number} has been ${isStopped? 'un-stopped' : 'stopped'}`, '', [
        //   { text: 'OK', onPress: () => getWorkspaceCampaigns(userData, showArchived) },
        // ]);
      }).catch((err) => {
        console.log(err.toJSON(), " Archive Error");

      })
    }

    const options = {
      weekday: 'numeric',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    };



    return (
      <Pressable style={{
        alignItems: "center", gap: 9, backgroundColor: colors.lightGrayPurple,
        borderRadius: 12, marginVertical: 5, paddingVertical: 10, paddingHorizontal: 5
      }} onPress={() => setIsExtra(!isExtra)}
      >
        <View style={{ justifyContent: "space-between", flexDirection: "row", alignItems: 'center', width: "100%" }}>
          <View style={{ flexDirection: 'row', alignItems: "center", gap: 8 }}>

            <View style={{ padding: 10, paddingVertical: 11.5, borderRadius: 20, backgroundColor: "#DFDFDF", alignItems: "center" }} >
              <Text style={{ color: "black", fontSize: 14, fontWeight: "500" }}>+1 {formatPhoneNumber(item?.meta?.number?.slice(1))}</Text>
            </View>
            <View style={{ flexDirection: "column", gap: 5, alignItems: "center" }}>

              <View style={{ flexDirection: "column", gap: 5, alignItems: "flex-start" }}>
                <Text style={{ fontWeight: "500", fontSize: 14, color: colors.black }}>{item?.meta?.first ? item?.meta?.first : item?.meta?.first_name} {item?.meta?.last ? item?.meta?.last : item?.meta?.last_name }</Text>
                <Text style={{ fontWeight: "500", fontSize: 12, color: colors.grayLight }}>#{item?.id}</Text>

              </View>
            </View>
          </View>
          <View style={{}}>


          </View>
          {/* <View style={{ padding: 12, flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Pressable style={{ padding: 12, backgroundColor: colors.pink, borderRadius: 10 }} onPress={() => { handleStopped() }}>
              <Feather name="trash" size={10} color="white" />
            </Pressable>
            <Entypo name="chevron-thin-down" size={18} color="black" />
          </View> */}
        </View>
        {
          isExtra && 
          <View>
            <Text style={{ fontWeight: "500", paddingVertical: 5 }}>Meta Data</Text>
            {
              item?.meta?.order_id &&
              <View style={{ flexDirection: "row" }}>
                <Text style={{ color: colors.grayLight }}>order_id: </Text>
                <Text style={{ color: colors.black }}>{item?.meta?.order_id}</Text>
              </View>
            }
            {
              item?.meta?.date &&
              <View style={{ flexDirection: "row" }}>
                <Text style={{ color: colors.grayLight }}>date: </Text>
                <Text style={{ color: colors.black }}>{item?.meta?.date}</Text>
              </View>
            }
            {
              item?.meta?.username &&
              <View style={{ flexDirection: "row" }}>
                <Text style={{ color: colors.grayLight }}>username: </Text>
                <Text style={{ color: colors.black }}>{item?.meta?.username}</Text>
              </View>
            }
            {
              item?.meta?.name &&
              <View style={{ flexDirection: "row" }}>
                <Text style={{ color: colors.grayLight }}>name: </Text>
                <Text style={{ color: colors.black }}>{item?.meta?.name}</Text>
              </View>
            }
            {
              item?.meta?.stream_link &&
              <View style={{ flexDirection: "row" }}>
                <Text style={{ color: colors.grayLight }}>stream_link: </Text>
                <Text style={{ color: colors.black }}>{item?.meta?.stream_link}</Text>
              </View>

            }
          </View>


        }
      </Pressable>
    )
  }



  return (
    <Modal
      propagateSwipe={true}
      animationIn="slideInRight"
      animationOut="slideOutRight"
      onSwipeComplete={() => setIsVisible(false)} // Handle swipe-to-dismiss
      swipeDirection={['left', 'right']} // Allow swiping left or right to dismiss
      animationInTiming={500}
      animationOutTiming={500}
      backdropTransitionInTiming={1000}
      backdropTransitionOutTiming={500}
      isVisible={isVisible}
      onBackdropPress={() => { setIsVisible(false) }}
      style={[styles.backModal,]}>
      <View style={[styles.main, { height: deviceHeight, marginTop: deviceHeight * .07 }]}>
        <View style={{ flexDirection: "row", gap: 5, padding: 8, alignItems: "center", paddingBottom: 25 }}>
          <Pressable style={{ position: "absolute", height: 70, top: -15, left: -15, width: "100%" }} onPress={() => { setIsVisible(false) }}></Pressable>

          <FontAwesome5 name="chevron-left" size={22} color="black" />

        </View>

        <Text style={{ fontWeight: "600", fontSize: 25, paddingBottom: 12 }}>All Contacts of {item.name ? item.name : campaignName}</Text>

        {
          contacts.map(contact => (
            <Contact item={contact} />
          ))
        }




      </View>




      <View style={{ paddingBottom: 30, paddingTop: 30 }} />


    </Modal >
  )
}

const styles = StyleSheet.create({

  main: {
    backgroundColor: "white",
    padding: 20,
    paddingTop: 40,
    flexDirection: "column",
    borderRadius: 10,
  },
  backModal: {
    margin: 0, // Fullscreen modal

  },

})

export default ShowAllContactsModal