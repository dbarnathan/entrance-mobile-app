import React, { useEffect, useState, useContext, useLayoutEffect, useCallback } from 'react'
import { Text, View, Pressable, useWindowDimensions, Image, Platform, SafeAreaView, Switch, KeyboardAvoidingView } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { TextInput } from 'react-native';
import { colors, fontSize } from '../../../theme'
import { UserDataContext } from '../../../context/UserDataContext'
import { ColorSchemeContext } from '../../../context/ColorSchemeContext'
import styles from './styles';
import axios from 'axios'
import { FontAwesome5, FontAwesome6, Ionicons } from '@expo/vector-icons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import EditTemplateModal from '../../../components/EditTemplateModal';
import { Dropdown } from 'react-native-element-dropdown';

export default function WorkspaceSettings() {
    const navigation = useNavigation()
    const deviceHeight = useWindowDimensions().height;
    const deviceWidth = useWindowDimensions().width;
    const route = useRoute()


    const { userData, workspaceUsers } = useContext(UserDataContext)

    const [templates, setTemplates] = useState([])

    const [showTemplate, setShowTemplate] = useState(false)

    const [workspaceSetting, setWorkspaceSetting] = useState({})

    const [seniors, setSeniors] = useState(false)
    const [shortListMax, setShortListMax] = useState("0")
    const [shortListDecay, setShortListDecay] = useState("0")
    const [filterShortList, setFilterShortList] = useState(false)
    const [disableClaims, setDisableClaims] = useState(false)
    const [disallowIdle, setDisallowIdle] = useState(false)

    const [hideContacts, setHideContacts] = useState(false)
    const [allowSeniorsEdit, setAllowSeniorsEdit] = useState(false)
    const [enableTwoFactor, setEnableTwoFactor] = useState(false)

    const [notifyUser, setNotifyUser] = useState(false)
    const [notifyAdmin, setNotifyAdmin] = useState(false)

    const [openTimeRestriction, setOpenTimeRestriction] = useState(["07", "30"])
    const [closeTimeRestriction, setCloseTimeRestriction] = useState(["07", "30"])

    const [messageSegmentLimit, setMessageSegmentLimit] = useState("8")
    const [blastNumberLimit, setBlastNumberLimit] = useState("2000")

    const [initialCooldown, setInitialCooldown] = useState(false)
    const [cooldownTimeLimit, setCooldownTimeLimit] = useState(false)
    const [channelLock, setChannelLock] = useState(false)
    const [segmentBudgeting, setSegmentBudgeting] = useState(false)
    const [shortlinkDomain, setShortlinkDomain] = useState("")

    const [messageImages, setMessageImages] = useState(false)

    const [metaData, setMetaData] = useState(false)

    const [blockContact, setBlockContact] = useState(false)

    const [autoArchiveFilter, setAutoArchiveFilter] = useState(false)
    const [stopSetting, setStopSetting] = useState("Archived")
    const [containsToFilter, setContainsToFilter] = useState(false)
    const [filteredPhrases, setFilteredPhrases] = useState(false)
    const [containsToUnsubscribe, setContainsToUnsubscribe] = useState(false)
    const [unsubscribePhrases, setUnsubscribePhrases] = useState(false)

    const [callBlocking, setCallBlocking] = useState(false)
    const [autoResponse, setAutoResponse] = useState(false)


    const [stopSettings, setStopSettings] = useState([
        {
            label: "Do Nothing", value: 0
        },
        {
            label: "Archive", value: 1
        },
        {
            label: "Delete", value: 2
        },
    ])
    const [isFocus5, setIsFocus5] = useState(false)
    const [selectedStopSetting, setSelectedStopSetting] = useState(0)


    const campaign_id = 1


    useEffect(() => {
        navigation.getParent()?.setOptions({
            tabBarStyle: {
                display: "none"
            }
        });
        return () => navigation.getParent()?.setOptions({
            tabBarStyle: {
                display: "inline"
            }
        });
    }, [])

    useEffect(() => {

        axios.get(`https://${process.env.EXPO_PUBLIC_LIVE}/workspaces/${userData.workspace_id}/settings`,
            {
                headers: {
                    'Authorization': userData.access_token
                }
            }).then((response) => {
                console.log("GET WORKSPACE SETTINGS: ", response?.data?.record)

                let result = response?.data?.record

                setSeniors(result.senior_subscriber_lists)
                setShortListMax(result.shortlist_max_size)
                setShortListDecay(result.shortlist_decay)
                setFilterShortList(result.filter_short)
                setDisableClaims(result.disable_claims)
                setDisallowIdle(result.disallow_idle_users)

                setHideContacts(result.hide_contacts)
                setAllowSeniorsEdit(result.allow_seniors_edit_users)
                setEnableTwoFactor(result.two_factor_phone_authentication)

                setNotifyUser(result.unread_notify_user_all)
                setNotifyAdmin(result.unread_notify_admin_all)

                const openTime = result.open_time_restriction.split(":")

                setOpenTimeRestriction([openTime[0], openTime[1]])

                const endTime = result.end_time_restriction.split(":")

                setCloseTimeRestriction([endTime[0], endTime[1]])

                setMessageSegmentLimit(result.segment_limit)
                setBlastNumberLimit(result.manual_numbers_limit)
                setInitialCooldown(result.initial_cooldown_enabled)
                setCooldownTimeLimit(result.cooldown_time_limit)
                setChannelLock(result.channel_locking)
                setSegmentBudgeting(result.segment_budgeting)
                setShortlinkDomain(result.shortlink_custom_domain)

                setMessageImages(result.allow_outgoing_images)
                setMetaData(result.allow_user_add_meta_data)
                setBlockContact(result.enable_block_contacts)

                setAutoArchiveFilter(result.auto_archive_filtered)
                setStopSetting(result.auto_stop_setting)

                // 
                setContainsToFilter(result.auto_archive_contains_to)
                setFilteredPhrases(result.auto_archive_filter_phrases)
                setContainsToUnsubscribe(result.auto_archive_contains_unsubscribe)
                setUnsubscribePhrases(result.auto_archive_unsubscribe_phrases)


                setCallBlocking(result.block_anonymous_calls)

                //
                setAutoResponse(result.enable_auto_response)

                setWorkspaceSetting(result)

            }).catch((err) => {
                console.log("WORKSPACE ERROR: ", err.toJSON());
            })

    }, [])


    const handleSettingChange = (newVal, setNewVal, body) => {
        console.log("What does this set function loook like: ", setNewVal, "New Val: ", newVal)
        setNewVal(newVal)
        axios.patch(`https://${process.env.EXPO_PUBLIC_LIVE}/workspaces/${userData.workspace_id}/settings`, body, { headers: { 'Authorization': userData.access_token } }).then((response) => {
            console.log("Successfully updated")


        }).catch((err) => {
            console.log(err, " :ERROR UPDATING CAMPAIGN");

        })
    }



    const workspace = [
        {
            name: "Allow Seniors to Create Subscriber Lists", description: "Let senior level users create and manage Subscriber lists",
            type: "switch", select: seniors, setSelection: setSeniors, property: { senior_subscriber_lists: seniors }
        },
        {
            name: "Shortlist Max Size", description: "Enter the max contacts users can have in their shortlist. Setting to zero disables it",
            type: "input", select: shortListMax, setSelection: setShortListMax, property: { shortlist_max_size: shortListMax }
        },
        {
            name: "Shortlist Decay (in hours)", description: "How long after a contact is last touch before it decays in the shortlist",
            type: "input", select: shortListDecay, setSelection: setShortListDecay, property: { shortlist_decay: shortListDecay }
        },
        {
            name: "Filter against shortlists", description: "Filters against existing contacts on shortlists",
            type: "switch", select: filterShortList, setSelection: setFilterShortList, property: { shortlist_filter_against: filterShortList }
        },
        {
            name: "Disable Claims", description: "Channels will be distributed evenly between users.",
            type: "switch", select: disableClaims, setSelection: setDisableClaims, property: { disable_claims: disableClaims }
        },
        {
            name: "Disallow Idle Users w/ Disabled Claims", description: "Users are set to idle after 30 mins of inactivity.",
            type: "switch", select: disallowIdle, setSelection: setDisallowIdle, property: { disallow_idle_users: disallowIdle }
        }

    ]

    const security = [
        {
            name: "Hide Contacts", description: "Hide contacts so seniors cannot view or interact with them.",
            type: "switch", select: hideContacts, setSelection: setHideContacts, property: { hide_contacts: hideContacts }
        },
        {
            name: "Allow Seniors to Edit Users", description: "This allows seniors to view and edit the workspace's users.",
            type: "switch", select: allowSeniorsEdit, setSelection: setAllowSeniorsEdit, property: { allow_seniors_edit_users: allowSeniorsEdit }
        },
        {
            name: "Enable Two Factor Phone Authentication", description: "This will force all users to use two-factor authentication to log into their accounts",
            type: "switch", select: enableTwoFactor, setSelection: setEnableTwoFactor, property: { shortlist_decay: enableTwoFactor }
        },


    ]

    const emails = [
        {
            name: "Notify User", description: "Sends a daily email to the user at 12pm noon and 6pm.",
            type: "switch", select: notifyUser, setSelection: setNotifyUser, property: { unread_notify_user_all: notifyUser }
        },
        {
            name: "Notify Admin", description: "Sends a daily email to the user at 12pm noon and 6pm.",
            type: "switch", select: notifyAdmin, setSelection: setNotifyAdmin, property: { unread_notify_admin_all: shortListMax }
        },

    ]

    const messageTime = [
        {
            name: "Open Time Restriction", description: "Messages won't be sent in the morning before this time.",
            type: "dropdown-time-am", select: openTimeRestriction, setSelection: setOpenTimeRestriction, property: { open_time_restriction: `${openTimeRestriction[0]}:${openTimeRestriction[1]}:00` }
        },
        {
            name: "Close Time Restriction", description: "Messages won't be sent after this time in the evening.",
            type: "dropdown-time-pm", select: closeTimeRestriction, setSelection: setCloseTimeRestriction, property: { close_time_restriction: `${closeTimeRestriction[0]}:${closeTimeRestriction[1]}:00` }
        },
    ]


    const messaging = [
        {
            name: "Message Segment Limit", description: "Set the max segments for user messages in workspace.",
            type: "dropdown-segment", select: messageSegmentLimit, setSelection: setMessageSegmentLimit, property: { segment_limit: messageSegmentLimit }
        },
        {
            name: "Manual Blast Number Limit", description: "Set the max numbers a user can send to in a manual blast.",
            type: "dropdown-number", select: blastNumberLimit, setSelection: setBlastNumberLimit, property: { manual_numbers_limit: blastNumberLimit }
        },
        {
            name: "Initial Cooldown", description: "When using 'Manual Blasts' between multiple users, it is possible a customer can be texted many times by different users. Initial Cooldown prevents other users in your workspaces from messaging the same customer within a certain timeframe. Set the time in hours to the right for this to be active for.",
            type: "input", select: initialCooldown, setSelection: setInitialCooldown, property: { initial_cooldown_enabled: initialCooldown }
        },
        {
            name: "Cooldown time limit", description: "When using 'Manual Blasts': On customer reply, grant exclusive rights to the user for a time limit set on the right.",
            type: "switch", select: cooldownTimeLimit, setSelection: setCooldownTimeLimit, property: { cooldown_time_limit: cooldownTimeLimit }
        },
        {
            name: "Channel Locking", description: "Enable the ability for workspace user's to lock channels",
            type: "switch", select: channelLock, setSelection: setChannelLock, property: { channel_locking: channelLock }
        },
        {
            name: "Segment Budgeting", description: "Turn on workspace's segment budgeting and then set a segment budget for each user on user page.",
            type: "switch", select: segmentBudgeting, setSelection: setSegmentBudgeting, property: { segment_budgeting: segmentBudgeting }
        },
        {
            name: "Shortlink Custom Domain", description: "Use your own custom domain shortlist IMPORTANT: your custom domain must be registered with Entrance and setup with correct DNS records to work properly",
            type: "switch", select: shortlinkDomain, setSelection: setShortlinkDomain, property: { shortlink_custom_domain: shortlinkDomain }
        }
    ]

    const images = [
        {
            name: "Allow Outcoming Images", description: "This will disable the ability for users to send images to contacts..",
            type: "switch", select: messageImages, setSelection: setMessageImages, property: { segment_limit: messageImages }
        },
    ]

    const meta = [
        {
            name: "Users Edit/Add Meta Data", description: "This will allow users with permission user to edit or add meta data to contacts.",
            type: "switch", select: metaData, setSelection: setMetaData, property: { allow_user_add_meta_data: metaData }
        },
    ]

    const blockContacts = [
        {
            name: "Users Block Contacts", description: "This will allow users to block contacts in messages.",
            type: "switch", select: blockContact, setSelection: setBlockContact, property: { enable_block_contacts: blockContact }
        },
    ]

    const claimsFiltering = [
        {
            name: "Auto Archive Filtered", description: "Messages that match or contain your filtered dictionary terms will be automatically archived.",
            type: "switch", select: autoArchiveFilter, setSelection: setAutoArchiveFilter, property: { auto_archive_filtered: autoArchiveFilter }
        },
        {
            name: "Auto Stop Setting", description: "Automatically archive, delete, or do nothing with stop and unsubscribe messages",
            type: "dropdown", select: stopSetting, setSelection: setStopSetting, property: { auto_stop_setting: stopSetting }
        },

    ]

    const filteredEntries = [
        {
            name: "Manage Filtered Entries", description: "Adds channels filters if phrase matches or contains phrases went contains is turned on for phrase.",
            type: "switch", select: containsToFilter, setSelection: setContainsToFilter, property_1: { auto_archive_contains_to: containsToFilter }, property_2: { filter_phrase: filteredPhrases }
        },
        {
            name: "Manage Unsubscribe Entries", description: "Unsubscribes channel and adds contact to stop list if phrase matches or contains phrases went contains is turned on for phrase.",
            type: "input", select: filteredPhrases, setSelection: setFilteredPhrases, property_1: { auto_unsubscribe_contains_to: containsToUnsubscribe }, property_2: { unsubscribe_phrase: unsubscribePhrases }
        },
    ]

    const callForardings = [
        {
            name: "Anonymous Call Blocking", description: "Turn this on to immediately hang up on anonymous calls.",
            type: "switch", select: callBlocking, setSelection: setCallBlocking, property: { block_anonymous_calls: callBlocking }
        },
        {
            name: "Auto-Response On Missed Calls", description: "Turn this on to auto-respond to any missed forwarded calls.",
            type: "switch", select: autoResponse, setSelection: setAutoResponse, property: { call_forwarding_auto_response: callBlocking }
        },
    ]

    const SettingComponent = useCallback(({ items, title }) => {

        const [isFocus1, setIsFocus1] = useState(false)
        const [isFocus2, setIsFocus2] = useState(false)
        const [isFocus3, setIsFocus3] = useState(false)
        const [isFocus4, setIsFocus4] = useState(false)

        const hourTime = Array.from({ length: 12 }, (_, i) => {
            const value = i + 1;
            return { label: value.toString(), value: value.toString() };
        })
        const minuteTime = Array.from({ length: 12 }, (_, i) => {
            const value = i * 5;
            return { label: value.toString(), value: value.toString() };
        })

        const segmentLimits = Array.from({ length: 8 }, (_, i) => {
            const value = (i + 1); // Start from 2^25
            return { label: i == 7 ? "8 (default)" : value.toString(), value: value.toString() };

        })
        const numberLimits = Array.from({ length: 6 }, (_, i) => {

            let pow = Math.pow(2, i)

            const value = pow * 25
            // let prev = value
            // Start from 2^25
            return { label: value.toString(), value: value.toString() };
        });

        numberLimits.push({ label: "1000", value: "1000" }, { label: "1200", value: "1200" }, { label: "1600", value: "1600" }, { label: "2000 (default)", value: "2000" });

        const [selectedOpenHour, setSelectedOpenHour] = useState("7")
        const [selectedOpenMinute, setSelectedOpenMinute] = useState("30")

        const [selectedCloseHour, setSelectedCloseHour] = useState("7")
        const [selectedCloseMinute, setSelectedCloseMinute] = useState("30")

        const [selectedSegment, setSelectedSegment] = useState("8")
        const [selectedNumber, setSelectedNumber] = useState("2000")

        useEffect(() => {
            console.log("SELECTED : ", hourTime)
        }, [])
        return (
            <View style={{
                flexDirection: "row", alignItems: "flex-start", justifyContent: "flex-start",
                shadowColor: "#000000",
                shadowOpacity: 0.3033,
                shadowRadius: 2.5,
                shadowOffset: {
                    height: 3,
                    width: 1
                },
                elevation: 5,
            }}>
                <View style={{ borderRadius: 12, backgroundColor: "white", margin: 10, padding: 12, flex: 1 }}>
                    <View style={{ marginBottom: 25 }}>
                        <Text style={{ fontWeight: "600", fontSize: 16, paddingBottom: 1 }}>{title}</Text>
                    </View>
                    {
                        items.map((item) => (
                            <View style={{ justifyContent: "space-between", marginBottom: 5 }}>
                                <View style={{ paddingBottom: 15 }}>
                                    <Text style={{ fontWeight: "500", fontSize: 14, paddingBottom: 5 }}>{item.name}</Text>
                                    <Text style={{ color: colors.grayLight, }}>{item.description}</Text>
                                </View>
                                {
                                    item.type == "dropdown-time-am" || item.type == "dropdown-time-pm" ?
                                        <View style={{ flexDirection: 'row', paddingBottom: 9 }}>
                                            {
                                                item.type == "dropdown-time-am" ?
                                                    <View style={{ flexDirection: "row", gap: 5, alignItems: "flex-end" }}>
                                                        <Dropdown
                                                            style={[styles.dropdown, isFocus1 && { borderColor: 'blue' }]}
                                                            data={hourTime}
                                                            selectedTextStyle={{ fontSize: 12 }}
                                                            inputSearchStyle={{ fontSize: 12 }}
                                                            itemTextStyle={{ fontSize: 12 }}
                                                            maxHeight={300}
                                                            labelField="label"
                                                            valueField="value"
                                                            dropdownPosition='top'

                                                            searchPlaceholder="Search..."
                                                            value={selectedOpenHour}
                                                            onFocus={() => setIsFocus1(true)}
                                                            onBlur={() => setIsFocus1(false)}
                                                            onChange={item => {
                                                                setSelectedOpenHour(item.value);
                                                                setIsFocus1(false);
                                                            }}

                                                        />
                                                        <Text style={{ paddingBottom: 5 }}>: </Text>
                                                        <Dropdown
                                                            style={[styles.dropdown, isFocus2 && { borderColor: 'blue' }]}
                                                            data={minuteTime}
                                                            selectedTextStyle={{ fontSize: 12 }}
                                                            inputSearchStyle={{ fontSize: 12 }}
                                                            itemTextStyle={{ fontSize: 12 }}
                                                            maxHeight={300}
                                                            dropdownPosition='top'
                                                            labelField="label"
                                                            valueField="value"
                                                            placeholder={!isFocus2 ? 'Select item' : '...'}
                                                            searchPlaceholder="Search..."
                                                            value={selectedOpenMinute}
                                                            onFocus={() => setIsFocus2(true)}
                                                            onBlur={() => setIsFocus2(false)}
                                                            onChange={item => {
                                                                setSelectedOpenMinute(item.value);
                                                                setIsFocus2(false);
                                                            }}

                                                        />
                                                        <Text style={{ paddingBottom: 5 }}>AM (EST)</Text>


                                                    </View> :
                                                    <View style={{ flexDirection: "row", gap: 5, alignItems: "flex-end" }}>
                                                        <Dropdown
                                                            style={[styles.dropdown, isFocus1 && { borderColor: 'blue' }]}
                                                            data={hourTime}
                                                            selectedTextStyle={{ fontSize: 12 }}
                                                            inputSearchStyle={{ fontSize: 12 }}
                                                            itemTextStyle={{ fontSize: 12 }}
                                                            maxHeight={300}
                                                            labelField="label"
                                                            valueField="value"
                                                            dropdownPosition='top'

                                                            searchPlaceholder="Search..."
                                                            value={selectedCloseHour}
                                                            onFocus={() => setIsFocus1(true)}
                                                            onBlur={() => setIsFocus1(false)}
                                                            onChange={item => {
                                                                setSelectedCloseHour(item.value);
                                                                setIsFocus1(false);
                                                            }}

                                                        />
                                                        <Text style={{ paddingBottom: 5 }}>: </Text>
                                                        <Dropdown
                                                            style={[styles.dropdown, isFocus2 && { borderColor: 'blue' }]}
                                                            data={minuteTime}
                                                            selectedTextStyle={{ fontSize: 12 }}
                                                            inputSearchStyle={{ fontSize: 12 }}
                                                            itemTextStyle={{ fontSize: 12 }}
                                                            maxHeight={300}
                                                            dropdownPosition='top'
                                                            labelField="label"
                                                            valueField="value"
                                                            placeholder={!isFocus2 ? 'Select item' : '...'}
                                                            searchPlaceholder="Search..."
                                                            value={selectedCloseMinute}
                                                            onFocus={() => setIsFocus2(true)}
                                                            onBlur={() => setIsFocus2(false)}
                                                            onChange={item => {
                                                                setSelectedCloseMinute(item.value);
                                                                setIsFocus2(false);
                                                            }}

                                                        />
                                                        <Text style={{ paddingBottom: 5 }}>PM (EST)</Text>


                                                    </View>
                                            }


                                        </View> : item.type == "dropdown-segment" ? <View>
                                            <Dropdown
                                                style={[styles.dropdown, isFocus3 && { borderColor: 'blue' }]}
                                                data={segmentLimits}
                                                selectedTextStyle={{ fontSize: 12 }}
                                                inputSearchStyle={{ fontSize: 12 }}
                                                itemTextStyle={{ fontSize: 12 }}
                                                maxHeight={300}
                                                labelField="label"
                                                valueField="value"
                                                dropdownPosition='top'
                                                placeholder={!isFocus3 ? 'Select item' : '...'}
                                                searchPlaceholder="Search..."
                                                value={selectedSegment}
                                                onFocus={() => setIsFocus3(true)}
                                                onBlur={() => setIsFocus3(false)}
                                                onChange={item => {
                                                    setSelectedSegment(item.value);
                                                    setIsFocus3(false);
                                                }}

                                            />
                                        </View> : item.type == "dropdown-number" ? <View>
                                            <Dropdown
                                                style={[styles.dropdown, isFocus4 && { borderColor: 'blue' }]}
                                                data={numberLimits}
                                                selectedTextStyle={{ fontSize: 12 }}
                                                inputSearchStyle={{ fontSize: 12 }}
                                                itemTextStyle={{ fontSize: 12 }}
                                                maxHeight={300}
                                                labelField="label"
                                                valueField="value"
                                                dropdownPosition='top'
                                                placeholder={!isFocus4 ? 'Select item' : '...'}
                                                searchPlaceholder="Search..."
                                                value={selectedNumber}
                                                onFocus={() => setIsFocus4(true)}
                                                onBlur={() => setIsFocus4(false)}
                                                onChange={item => {
                                                    setSelectedNumber(item.value);
                                                    setIsFocus4(false);
                                                }}

                                            />
                                        </View> :
                                            <Switch
                                                trackColor={{ false: '#767577', true: '#81b0ff' }}
                                                thumbColor={item.select ? '#f5dd4b' : '#f4f3f4'}
                                                ios_backgroundColor="#3e3e3e"
                                                onValueChange={(value) => handleSettingChange(value, item.setSelection, item.property)}
                                                value={item.select}
                                                style={{
                                                    transform: [{ scaleX: Platform.OS == "ios" ? .75 : 1 }, { scaleY: Platform.OS == "ios" ? .75 : 1 }] // Change the scale as needed
                                                }}
                                            />
                                }

                                <View style={{ borderBottomColor: "#BFBFBF", borderBottomWidth: 1, width: "100%", marginTop: 10 }}></View>

                            </View>
                        ))
                    }

                </View>

            </View>
        )
    }, [])



    return (
        <>
            <EditTemplateModal isVisible={showTemplate} setIsVisible={setShowTemplate} item={templates} />
            <View style={{ padding: 12, marginTop: -15, paddingBottom: 0, justifyContent: "space-between", flexDirection: "row", backgroundColor: "white", alignItems: "center" }}>

                <View style={{ flexDirection: "row", gap: 5, padding: 8, alignItems: "center" }}>
                    <Pressable style={{ position: "absolute", height: 70, width: 90, top: -15, left: -15 }} onPress={() => { navigation.goBack() }}></Pressable>

                    <FontAwesome5 name="chevron-left" size={22} color="black" />


                </View>
                <View style={{}}>
                    <Text style={{ fontSize: 18, fontWeight: "500" }}>Workspace Settings</Text>
                </View>
                <View style={{ alignItems: "flex-start", }}>
                    <Image source={require('../../../../assets/images/purpleE.png')} resizeMode='contain'
                        style={{ alignSelf: "flex-start", height: deviceHeight * .05, width: deviceWidth * .08, }} />
                </View>
            </View>
            <KeyboardAwareScrollView bounces={false} keyboardShouldPersistTaps={'always'} keyboardDismissMode="on-drag" style={{ backgroundColor: "#FAF0DC", height: "100%", }}
                resetScrollToCoords={null}
                enableOnAndroid={true}
                showsVerticalScrollIndicator={false}
                extraScrollHeight={0}>

                <View style={{
                    flexDirection: "row", alignItems: "flex-start", justifyContent: "flex-start",
                    shadowColor: "#000000",
                    shadowOpacity: 0.3033,
                    shadowRadius: 2.5,
                    shadowOffset: {
                        height: 3,
                        width: 1
                    },
                    elevation: 5,
                }}>
                    <View style={{ borderRadius: 12, backgroundColor: "white", margin: 10, padding: 12, flex: 1 }}>
                        <View style={{ marginBottom: 25 }}>
                            <Text style={{ fontWeight: "600", fontSize: 16, paddingBottom: 1 }}>Workspace Settings</Text>
                        </View>
                        {
                            workspace.map((item) => (
                                <View style={{ justifyContent: "space-between", marginBottom: 10 }}>
                                    <View>
                                        <Text style={{ fontWeight: "500", fontSize: 14, paddingBottom: 5 }}>{item.name}</Text>
                                        <Text style={{ color: colors.grayLight, }}>{item.description}</Text>
                                    </View>
                                    {
                                        item.type == "switch" ?
                                            <Switch
                                                trackColor={{ false: '#767577', true: '#81b0ff' }}
                                                thumbColor={item.select ? '#f5dd4b' : '#f4f3f4'}
                                                ios_backgroundColor="#3e3e3e"
                                                onValueChange={(value) => handleSettingChange(value, item.setSelection, item.property)}
                                                value={item.select}
                                                style={{
                                                    transform: [{ scaleX: Platform.OS == "ios" ? .75 : 1 }, { scaleY: Platform.OS == "ios" ? .75 : 1 }] // Change the scale as needed
                                                }}
                                            /> :
                                            <TextInput
                                                style={{ backgroundColor: colors.lightGrayPurple, color: "black", borderRadius: 12, fontSize: 16, padding: 12, borderColor: "#7972BC", borderWidth: 1, width: "65%", marginTop: 10 }}
                                                placeholderTextColor={"gray"}
                                                placeholder={"10"}
                                                maxLength={11}
                                                keyboardType={"phone-pad"}
                                                onChangeText={(value) => handleSettingChange(value, item?.setSelection, item.property)}
                                                value={item.select}


                                            />
                                    }
                                    <View style={{ borderBottomColor: "#BFBFBF", borderBottomWidth: 1, width: "100%", marginTop: 10 }}></View>

                                </View>
                            ))
                        }

                    </View>

                </View>
                <View style={{
                    flexDirection: "row", alignItems: "flex-start", justifyContent: "flex-start",
                    shadowColor: "#000000",
                    shadowOpacity: 0.3033,
                    shadowRadius: 2.5,
                    shadowOffset: {
                        height: 3,
                        width: 1
                    },
                    elevation: 5,
                }}>
                    <View style={{ borderRadius: 12, backgroundColor: "white", margin: 10, padding: 12, flex: 1 }}>
                        <View style={{ marginBottom: 25 }}>
                            <Text style={{ fontWeight: "600", fontSize: 16, paddingBottom: 1 }}>Security Settings</Text>
                        </View>
                        {
                            security.map((item) => (
                                <View style={{ justifyContent: "space-between", marginBottom: 10 }}>
                                    <View>
                                        <Text style={{ fontWeight: "500", fontSize: 14, paddingBottom: 5 }}>{item.name}</Text>
                                        <Text style={{ color: colors.grayLight, }}>{item.description}</Text>
                                    </View>
                                    {
                                        item.type == "switch" ?
                                            <Switch
                                                trackColor={{ false: '#767577', true: '#81b0ff' }}
                                                thumbColor={item.select ? '#f5dd4b' : '#f4f3f4'}
                                                ios_backgroundColor="#3e3e3e"
                                                onValueChange={(value) => handleSettingChange(value, item.setSelection, item.property)}
                                                value={item.select}
                                                style={{
                                                    transform: [{ scaleX: Platform.OS == "ios" ? .75 : 1 }, { scaleY: Platform.OS == "ios" ? .75 : 1 }] // Change the scale as needed
                                                }}
                                            /> :
                                            <TextInput
                                                style={{ backgroundColor: colors.lightGrayPurple, color: "black", borderRadius: 12, fontSize: 16, padding: 12, borderColor: "#7972BC", borderWidth: 1, width: "65%", marginTop: 10 }}
                                                placeholderTextColor={"gray"}
                                                placeholder={"10"}
                                                maxLength={11}
                                                keyboardType={"phone-pad"}
                                                onChangeText={(value) => handleSettingChange(value, item?.setSelection, item.property)}
                                                value={item.select}


                                            />
                                    }
                                    <View style={{ borderBottomColor: "#BFBFBF", borderBottomWidth: 1, width: "100%", marginTop: 10 }}></View>

                                </View>
                            ))
                        }

                    </View>

                </View>

                <View style={{
                    flexDirection: "row", alignItems: "flex-start", justifyContent: "flex-start",
                    shadowColor: "#000000",
                    shadowOpacity: 0.3033,
                    shadowRadius: 2.5,
                    shadowOffset: {
                        height: 3,
                        width: 1
                    },
                    elevation: 5,
                }}>
                    <View style={{ borderRadius: 12, backgroundColor: "white", margin: 10, padding: 12, flex: 1 }}>
                        <View style={{ marginBottom: 25 }}>
                            <Text style={{ fontWeight: "600", fontSize: 16, paddingBottom: 1 }}>Email Notifications</Text>
                        </View>
                        {
                            emails.map((item) => (
                                <View style={{ justifyContent: "space-between", marginBottom: 10 }}>
                                    <View>
                                        <Text style={{ fontWeight: "500", fontSize: 14, paddingBottom: 5 }}>{item.name}</Text>
                                        <Text style={{ color: colors.grayLight, }}>{item.description}</Text>
                                    </View>
                                    {
                                        item.type == "switch" ?
                                            <Switch
                                                trackColor={{ false: '#767577', true: '#81b0ff' }}
                                                thumbColor={item.select ? '#f5dd4b' : '#f4f3f4'}
                                                ios_backgroundColor="#3e3e3e"
                                                onValueChange={(value) => handleSettingChange(value, item.setSelection, item.property)}
                                                value={item.select}
                                                style={{
                                                    transform: [{ scaleX: Platform.OS == "ios" ? .75 : 1 }, { scaleY: Platform.OS == "ios" ? .75 : 1 }] // Change the scale as needed
                                                }}
                                            /> :
                                            <TextInput
                                                style={{ backgroundColor: colors.lightGrayPurple, color: "black", borderRadius: 12, fontSize: 16, padding: 12, borderColor: "#7972BC", borderWidth: 1, width: "65%", marginTop: 10 }}
                                                placeholderTextColor={"gray"}
                                                placeholder={"10"}
                                                maxLength={11}
                                                keyboardType={"phone-pad"}
                                                onChangeText={(value) => handleSettingChange(value, item?.setSelection, item.property)}
                                                value={item.select}


                                            />
                                    }
                                    <View style={{ borderBottomColor: "#BFBFBF", borderBottomWidth: 1, width: "100%", marginTop: 10 }}></View>

                                </View>
                            ))
                        }

                    </View>

                </View>

                <SettingComponent items={messageTime} title="Message Time Restrictions" />

                <SettingComponent items={messaging} title="Message Messaging" />
                <SettingComponent items={images} title="Message Images" />
                <SettingComponent items={meta} title="Message Data" />
                <SettingComponent items={blockContacts} title="Block Contacts" />

                <View style={{
                    flexDirection: "row", alignItems: "flex-start", justifyContent: "flex-start",
                    shadowColor: "#000000",
                    shadowOpacity: 0.3033,
                    shadowRadius: 2.5,
                    shadowOffset: {
                        height: 3,
                        width: 1
                    },
                    elevation: 5,
                }}>
                    <View style={{ borderRadius: 12, backgroundColor: "white", margin: 10, padding: 12, flex: 1 }}>
                        <View style={{ marginBottom: 25 }}>
                            <Text style={{ fontWeight: "600", fontSize: 16, paddingBottom: 1 }}>Manage Claims Filtering</Text>
                        </View>
                        {
                            claimsFiltering.map((item) => (
                                <View style={{ justifyContent: "space-between", marginBottom: 10 }}>
                                    <View>
                                        <Text style={{ fontWeight: "500", fontSize: 14, paddingBottom: 5 }}>{item.name}</Text>
                                        <Text style={{ color: colors.grayLight, }}>{item.description}</Text>
                                    </View>
                                    {
                                        item.type == "switch" ?
                                            <Switch
                                                trackColor={{ false: '#767577', true: '#81b0ff' }}
                                                thumbColor={item.select ? '#f5dd4b' : '#f4f3f4'}
                                                ios_backgroundColor="#3e3e3e"
                                                onValueChange={(value) => handleSettingChange(value, item.setSelection, item.property)}
                                                value={item.select}
                                                style={{
                                                    transform: [{ scaleX: Platform.OS == "ios" ? .75 : 1 }, { scaleY: Platform.OS == "ios" ? .75 : 1 }] // Change the scale as needed
                                                }}
                                            /> : item.type == "dropdown" ?
                                                <Dropdown
                                                    style={[styles.dropdown, isFocus5 && { borderColor: 'blue' }]}
                                                    data={stopSettings}
                                                    selectedTextStyle={{ fontSize: 12 }}
                                                    inputSearchStyle={{ fontSize: 12 }}
                                                    itemTextStyle={{ fontSize: 12 }}
                                                    maxHeight={300}
                                                    labelField="label"
                                                    valueField="value"
                                                    dropdownPosition='top'
                                                    placeholder={!isFocus5 ? 'Select item' : '...'}
                                                    searchPlaceholder="Search..."
                                                    value={selectedStopSetting}
                                                    onFocus={() => setIsFocus5(true)}
                                                    onBlur={() => setIsFocus5(false)}
                                                    onChange={item => {
                                                        setSelectedStopSetting(item.value);
                                                        setIsFocus5(false);
                                                    }}

                                                /> :
                                                <TextInput
                                                    style={{ backgroundColor: colors.lightGrayPurple, color: "black", borderRadius: 12, fontSize: 16, padding: 12, borderColor: "#7972BC", borderWidth: 1, width: "65%", marginTop: 10 }}
                                                    placeholderTextColor={"gray"}
                                                    placeholder={"10"}
                                                    maxLength={11}
                                                    keyboardType={"phone-pad"}
                                                    onChangeText={(value) => handleSettingChange(value, item?.setSelection, item.property)}
                                                    value={item.select}


                                                />
                                    }
                                    <View style={{ borderBottomColor: "#BFBFBF", borderBottomWidth: 1, width: "100%", marginTop: 10 }}></View>

                                </View>
                            ))
                        }
                        {
                            filteredEntries.map((item) => (
                                <View style={{ marginBottom: 10 }}>
                                    <View style={{ marginBottom: 15 }}>
                                        <Text style={{ fontWeight: "600", fontSize: 18, paddingBottom: 1 }}>{item.name}</Text>
                                        <Text style={{ color: colors.grayLight, }}>{item.description}</Text>
                                    </View>
                                    <Text style={{ fontWeight: "600", fontSize: 16 }}>
                                        Add Filter
                                    </Text>
                                    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                                        <Text>Turn on to filter if message contains phrase</Text>
                                        <Switch
                                            trackColor={{ false: '#767577', true: '#81b0ff' }}
                                            thumbColor={item.select ? '#f5dd4b' : '#f4f3f4'}
                                            ios_backgroundColor="#3e3e3e"
                                            onValueChange={(value) => handleSettingChange(value, item.setSelection, item.property_1)}
                                            value={item.select}
                                            style={{
                                                transform: [{ scaleX: Platform.OS == "ios" ? .75 : 1 }, { scaleY: Platform.OS == "ios" ? .75 : 1 }] // Change the scale as needed
                                            }}
                                        />
                                    </View>
                                    <View style={{ flexDirection: "row", gap: 12, alignItems: "center" }}>
                                        <TextInput
                                            style={{ backgroundColor: colors.lightGrayPurple, color: "black", borderRadius: 12, fontSize: 16, padding: 12, borderColor: "#7972BC", borderWidth: 1, width: "65%", marginTop: 10 }}
                                            placeholderTextColor={"gray"}
                                            placeholder={"10"}
                                            maxLength={11}
                                            keyboardType={"phone-pad"}
                                            onChangeText={(value) => handleSettingChange(value, item?.setSelection, item.property_2)}
                                            value={item.select} />
                                        <Pressable style={[styles.updateButton, { backgroundColor: "#0162E8", paddingVertical: 9 }]} onPress={() => { handleSettingChange(item.select, item?.setSelection, item.property_2) }}>


                                            <Text style={{ color: "white", fontSize: 12, fontWeight: "600" }}>Save</Text>

                                        </Pressable>

                                    </View>
                                </View>

                            ))
                        }


                    </View>

                </View>

                <SettingComponent items={callForardings} title="Call Forwarding" />



                <View style={{ marginBottom: 30 }} />




            </KeyboardAwareScrollView>
        </>



    )
}

