import React, { useEffect, useCallback, useMemo, useRef, useState, useContext } from "react"
import {  useWindowDimensions,  StyleSheet, Platform} from 'react-native';
import { UserDataContext } from "../context/UserDataContext";
import Modal from "react-native-modal";
import colors from "../theme/colors";
import RNDateTimePicker from "@react-native-community/datetimepicker"
export const DateModal = (props) => {
    const { date, setDate, isVisible, setIsVisible, } = props

    const { userData, userFlags, getChannels, unread, setUnread, bookmarked, setBookmarked, oldest, setOldest, selectedFlag, setSelectedFlag } = useContext(UserDataContext)
    const [campaignFocus, setCampaignFocus] = useState(false)
    const [flagFocus, setFlagFocus] = useState(false)



    const [selectedCampaign, setSelectedCampaign] = useState("")


    const [campaigns, setCampaigns] = useState([])

    const deviceHeight = useWindowDimensions().height

    const deviceWidth = useWindowDimensions().width



    const currentDate = date ? date : new Date()
    const incrementDate = date ? date : currentDate.setDate(currentDate.getDate() + 1)


    const onChange = (event, date) => {
        if (event.type === 'dismissed') {
            console.log('Picker dismissed');
            setIsVisible(false);
        } else if (event.type === 'set' && date) {
            console.log('Date selected:', date);
            setDate(date);
            setIsVisible(false);
        }

    };



    return (

        <RNDateTimePicker value={new Date(incrementDate)} onChange={onChange} themeVariant="light" />

    )
}

const styles = StyleSheet.create({

    main: {
        backgroundColor: colors.white,

        borderRadius: 20,

        padding: 20,
        flexDirection: "column"

    },
    backModal: {

        margin: 20,
        marginTop: 50

    },
    dropdown: {
        paddingVertical: 5,
        borderColor: 'gray',
        borderWidth: 0.5,
        borderRadius: 8,
        paddingHorizontal: 8,
        width: '40%',

    },

})

export default DateModal