import React, { createContext, useState, useEffect } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { doc, onSnapshot, collection, query, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import axios from 'axios';
import { request } from '../utils/functions';
import { parse } from 'expo-linking';
import MakeEntranceWebsocket from '@entrancegrp/websockets';
import { socket } from '../sockets/socket';
export const UserDataContext = createContext();

export const UserDataContextProvider = (props) => {
  const [userData, setUserData] = useState('')
  const [followList, setFollowList] = useState([])
  const [savedList, setSavedList] = useState([])
  const [likedList, setLikedList] = useState([])
  const [userFlags, setUserFlags] = useState([])
  const [selection, setSelection] = useState({ title: "", tags: [], image: "", ingredients: [""], steps: [{ text: "", image: "" }] })
  const [channelList, setChannelList] = useState([])

  const [currentList, setCurrentList] = useState([])
  const [noGodList, setNoGodList] = useState([])
  const [archivedList, setArchivedList] = useState([])
  const [unreadNumber, setUnreadNumber] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [archiveChecked, setArchiveChecked] = useState(false)
  const [godChecked, setGodChecked] = useState(false)
  const [claimedList, setClaimedList] = useState([])
  const [regList, setRegList] = useState([])
  const [currentClaimed, setCurrentClaimed] = useState([])
  const [currentFilter, setCurrentFilter] = useState("1")
  const [campaigns, setCampaigns] = useState([])
  const [recentCampaigns, setRecentCampaigns] = useState([])
  const [workspaceUsers, setWorkspaceUsers] = useState([])
  const [userSettings, setUserSettings] = useState([])
  const [userBlasts, setUserBlasts] = useState([])
  const [userGroups, setUserGroups] = useState([])

  const [contactList, setContactList] = useState([])
  const [contacts, setContacts] = useState([])

  const [workspaceCampaigns, setWorkspaceCampaigns] = useState([])

  const [isEnabled, setIsEnabled] = useState(false)
  const [isAlwaysReplaced, setIsAlwaysReplaced] = useState(false)

  const [expoPushToken, setExpoPushToken] = useState('');

  const [unread, setUnread] = useState(false)
  const [bookmarked, setBookmarked] = useState(false)
  const [oldest, setOldest] = useState(false)

  const [selectedFlag, setSelectedFlag] = useState("all")

  const [numbers, setNumbers] = useState([])

  const [userRole, setUserRole] = useState("")

  const [blockedNumbers, setBlockedNumbers] = useState([])



  // const socketConfigs = {
  //   url: "wss://sck.beta.entrancegrp.com",
  //   logging: true,
  //   callbackTimout: 60000,
  //   onConnect: Authenticate
  // }



  // const socket = MakeEntranceWebsocket(socketConfigs)

  // function Authenticate(err, isConnected, token) {


  //   console.log('Authenticatin...: ', token);

  //   socket.Subscribe('CHANNEL_EVENT', (data) => {
  //     console.log(
  //       "DATA FROM WEBSOCKET CHANNEL: ", data
  //     )
  //   })

  //   socket.Subscribe('MESSAGE_EVENT', (data) => {
  //     console.log(
  //       "DATA FROM WEBSOCKET MESSAGE: ", data
  //     )

  //   })
  //   console.log("Authenticate Successful: ", isConnected);

  //   socket.Send(socket.EVENTS.AUTHENTICATE, { token: token });

  // }

  useEffect(() => {
    retrieveData()
  }, [])



  const retrieveData = async () => {
    try {
      const value = await AsyncStorage.getItem('token')


      if (value !== null) {
        const current = new Date()


        const parsedData = JSON.parse(value);
        console.log("PARSED: ", parsedData)


        const oldDate = Date.parse(parsedData.last_login)

        var diff = (current.getTime() - oldDate) / 1000;
        // // Convert the difference from milliseconds to hours by dividing it by the number of seconds in an hour (3600)
        diff /= (60 * 60);
        // // Return the absolute value of the 
        const hours = Math.abs(Math.round(diff))

        console.log("Logged in about ", hours, " hours ago", " Last Login: ", parsedData.last_login, "IS NAN: ", isNaN(oldDate))


        if (hours > 23) {
          setUserData(parsedData);
          axios.post(`https://${process.env.EXPO_PUBLIC_LIVE}/authentication/refresh-token`, { client_id: parsedData.client_id, refresh_token: parsedData.refresh_token }, { headers: { 'Authorization': parsedData.access_token } }).then(async (response) => {
            console.log("Refresh token: ", response.data.record)
            parsedData.access_token = response.data.record.access_token
            parsedData.refresh_token = response.data.record.refresh_token
            parsedData.last_login = new Date()
            await AsyncStorage.setItem('token', JSON.stringify(parsedData))
            setUserData(response.data.record);
            getChannels(response.data.record)
            getUnClaimed(response.data.record)
            getGodChannels(response.data.record)
            getFlags(response.data.record)
            getAllCampaigns(response.data.record)
            getRecentCampaigns(response.data.record)
            getWorkspaceUsers(response.data.record)
            getUserSettings(response.data.record)
            getWorkspaceCampaigns(response.data.record)
            getUserGroups(response.data.record)
            getUserSentBlasts(response.data.record)
            getContacts(response.data.record)
            getContactLists(response.data.record)
            getWorkspaceNumbers(response.data.record)
            getUserPermission(response.data.record)
            getBlockedNumbers(response.data.record)

            try {
              socket.Connect(response.data.record.access_token)

              console.log("Socket?:  ", socket)
            } catch (err) {
              console.error("Webscoket connect error: ", err)
            }
            console.log("New Token Data: ", parsedData)


          }).catch((err) => console.log("Error Refreshing Token: ", err.response.data))
        } else {
          console.log("No API call")
          if (isNaN(oldDate)) {
            parsedData.last_login = new Date()
            await AsyncStorage.setItem('token', JSON.stringify(parsedData))
          }

          setUserData(parsedData);
          getChannels(parsedData)
          getUnClaimed(parsedData)
          getGodChannels(parsedData)
          getFlags(parsedData)
          getAllCampaigns(parsedData)
          getRecentCampaigns(parsedData)
          getWorkspaceUsers(parsedData)
          getUserSettings(parsedData)
          getWorkspaceCampaigns(parsedData)
          getUserGroups(parsedData)
          getUserSentBlasts(parsedData)
          getContacts(parsedData)
          getContactLists(parsedData)
          getWorkspaceNumbers(parsedData)
          getUserPermission(parsedData)
          getBlockedNumbers(parsedData)
          console.log("Socket????:  ")
          try {
            socket.Connect(parsedData.access_token)
            console.log(socket, " <- Socket")
          } catch (err) {
            console.log("Webscoket connect error: ", err)
          }
       
        }

        setIsEnabled(parsedData.isEmailMeta)

      }


    } catch (err) {
      console.log("Error Accessing AsyncStorages: ", err)
    }
  }

  const getUserPermission = async (data) => {
    let temp = []
    axios.get(`https://${process.env.EXPO_PUBLIC_LIVE}/users/${data.user_id}`, {
      headers: {
        'Authorization': data.access_token
      }
    }).then((response) => {
      console.log("get user permission: ", response.data.record)

      let sort1 = response.data.record.permission


      setUserRole(sort1)

    }).catch((err) => {
      console.log("Error Getting Perms: ", err.toJSON());
    })
  }



  const getWorkspaceNumbers = (data) => {
    axios.get(`https://${process.env.EXPO_PUBLIC_LIVE}/workspace-numbers?last_id=99999999999&order=DESC&limit=10&stats=month`,
      {
        headers: {
          'Authorization': data.access_token
        }
      }).then((response) => {
        console.log("USER WORKSPACE NUMBERS: ", response?.data?.records)

        let sort1 = response?.data?.records

        setNumbers(sort1)

      }).catch((err) => {
        console.log("WORKSPACE ERROR: ", err.toJSON());
      })
  }

  const getBlockedNumbers = (data) => {
    axios.get(`https://${process.env.EXPO_PUBLIC_LIVE}/workspace-blocked-numbers?last_id=99999999999&order=DESC&limit=10&stats=month`,
      {
        headers: {
          'Authorization': data.access_token
        }
      }).then((response) => {
        console.log("USER WORKSPACE BLOCKED NUMBERS: ", response?.data?.records)

        let sort1 = response?.data?.records

        setBlockedNumbers(sort1)

      }).catch((err) => {
        console.log("WORKSPACE ERROR: ", err.toJSON());
      })
  }


  const getAllCampaigns = async (data) => {
    let temp = []
    axios.get(`https://${process.env.EXPO_PUBLIC_LIVE}/workspaces/${data.workspace_id}/daily-analytics?days=10`, {
      headers: {
        'Authorization': data.access_token
      }
    }).then((response) => {
      console.log("Campaigns fom all Campains: ", response.data.records)

      let sort1 = response.data.records.sort((a, b) => { return a.sent_at - b.sent_at })


      setCampaigns(sort1)

    }).catch((err) => {
      console.log(err.toJSON());
    })
  }

  const getWorkspaceCampaigns = async (data, archived = false, type = "HOOK,SINGLE_BLAST,RETARGET", subscriber = "false") => {
    let temp = []
    console.log("Campaigns from Workspace: ", data)
    axios.get(`https://${process.env.EXPO_PUBLIC_LIVE}/campaigns?order=DESC&limit=100&types=${type}&subscriber=${subscriber}`, {
      headers: {
        'Authorization': data.access_token
      }
    }).then((response) => {
      console.log("ALL WORKSPACE CAMPAIGNS: ", response.data.records)

      let sort1 = response.data.records.filter((item) => item.archive == archived)
      console.log("Campaigns with archived: ", archived, "\n", sort1)
      setWorkspaceCampaigns(sort1)

    }).catch((err) => {
      console.log(err.toJSON());
    })
  }

  const getRecentCampaigns = async (data) => {
    let temp = []
    axios.get(`https://${process.env.EXPO_PUBLIC_LIVE}/campaigns?order=DESC&limit=100&types=HOOK,SINGLE_BLAST`, {
      headers: {
        'Authorization': data.access_token
      }
    }).then((response) => {
      console.log("Campaigns: ", response.data.records)

      let sort1 = response.data.records

      setRecentCampaigns(sort1)

    }).catch((err) => {
      console.log(err.toJSON());
    })
  }

  const getAllContacts = async () => {
    axios.get(`https://${process.env.EXPO_PUBLIC_LIVE}/workspace-analytics/${data.workspace_id}/manual-blast-data?period=month`, {
      headers: {
        'Authorization': data.access_token
      },
      params: {
        start_date: start,
        end_date: end
      }
    }).then((response) => {
      console.log("USER SENT BLAST MESSAGES: ", response.data.records)

      let sort1 = response.data.records

      setUserBlasts(sort1)

    }).catch((err) => {
      console.log(err.toJSON());
    })
  }

  const getUserSentBlasts = async (data, start = null, end = null) => {
    let temp = []
    console.log("GET WORKSPACE ID : ", data.workspace_id)
    axios.get(`https://${process.env.EXPO_PUBLIC_LIVE}/workspace-analytics/${data.workspace_id}/manual-blast-data?period=month`, {
      headers: {
        'Authorization': data.access_token
      },
      params: {
        start_date: start,
        end_date: end
      }
    }).then((response) => {
      console.log("USER SENT BLASTS: ", response.data.records)

      let sort1 = response.data.records

      setUserBlasts(sort1)

    }).catch((err) => {
      console.log(err.toJSON());
    })
  }

  const getWorkspaceUsers = async (data) => {
    let temp = []
    axios.get(`https://${process.env.EXPO_PUBLIC_LIVE}/users?last_id=9999999999999&limit=20&order=DESC`, {
      headers: {
        'Authorization': data.access_token
      }
    }).then((response) => {
      console.log("Campaigns: ", response.data.records)

      let sort1 = response.data.records

      setWorkspaceUsers(sort1)

    }).catch((err) => {
      console.log(err.toJSON());
    })
  }

  const getUserSettings = async (data) => {
    let temp = []
    axios.get(`https://${process.env.EXPO_PUBLIC_LIVE}/users/${data.user_id}`, {
      headers: {
        'Authorization': data.access_token
      }
    }).then((response) => {
      console.log("Campaigns: ", response.data.records)

      let sort1 = response.data.record

      setUserSettings(sort1)

    }).catch((err) => {
      console.log(err.toJSON());
    })
  }

  const getUserGroups = async (data) => {
    let temp = []
    axios.get(`https://${process.env.EXPO_PUBLIC_LIVE}/user-groups?lastid=9999999999&limit=20&order=DESC`, {
      headers: {
        'Authorization': data.access_token
      }
    }).then((response) => {
      console.log("Campaigns: ", response.data.records)

      let sort1 = response.data.records


      setUserGroups(sort1)

    }).catch((err) => {
      console.log(err.toJSON());
    })
  }

  const getFlags = async (data) => {

    axios.get(`https://${process.env.EXPO_PUBLIC_LIVE}/flags?lastid=99999999999&order=DESC`, {
      headers: {
        'Authorization': data.access_token
      },
      params: {
        adminview: true,
      }
    }).then((response) => {
      console.log(response.data.records, "  :Flags")
      setUserFlags(response.data.records)


    }).catch((err) => {
      console.log(err.toJSON());

    })

  }

  const getContactLists = (data) => {
    axios.get(`https://${process.env.EXPO_PUBLIC_LIVE}/contact-lists`, {
      headers: {
        'Authorization': data.access_token
      },
    }).then((response) => {
      console.log(response.data.records, "  : CONTACT LIST")
      let sort = response.data.records

      setContactList(sort)


    }).catch((err) => {
      console.log("CONTACTS LIST ERROR: ", err.toJSON());

    })
  }

  const getContacts = (data, isStopped = false, isActive = false) => {
    axios.get(`https://${process.env.EXPO_PUBLIC_LIVE}/contacts?limit=300&order=ASC`, {
      headers: {
        'Authorization': data.access_token
      },
    }).then((response) => {
      console.log(response.data.records, "  : CONTACT")
      let sort = response.data.records
      if (isStopped) {
        sort = sort.filter((contact) => contact.stop == isStopped)
      }

      if (isActive) {
        sort = sort.filter((contact) => contact.stop == false)
      }
      setContacts(sort)


    }).catch((err) => {
      console.log("CONTACTS ERROR: ", err.toJSON());

    })
  }


  const getUnClaimed = (data) => {
    axios.get(`https://${process.env.EXPO_PUBLIC_LIVE}/channels`, {
      headers: {
        'Authorization': data.access_token
      },

    }).then((response) => {
      console.log("Claimed Records: ", response.data.records)
      setClaimedList(response.data.records)
      setCurrentClaimed(response.data.records)
    }).catch((err) => {
      console.log(err.toJSON());
    })
  }

  const getGodChannels = (data) => {
    let list1 = []
    let list2 = []
    let unread
    axios.get(`https://${process.env.EXPO_PUBLIC_LIVE}/channels`, {
      headers: {
        'Authorization': data.access_token
      },
      params: {
        limit: 999,
        bookmarked: true

      }
    }).then((response) => {
      list1 = response.data.records;
      axios.get(`https://${process.env.EXPO_PUBLIC_LIVE}/channels`, {
        headers: {
          'Authorization': data.access_token
        },
        params: {
          limit: 999,
          bookmarked: false

        }
      }).then((response2) => {
        list2 = response2.data.records;
        const combined = [...list1, ...list2]
        var result = combined.reduce((unique, o) => {
          if (!unique.some(obj => obj.id == o.id)) {
            unique.push(o);
          }
          return unique;
        }, []);
        result.sort((a, b) => new Date(b.last_response) - new Date(a.last_response));

        console.log(result, " : GOD MODE CHANNEL DATA")
        setChannelList(result)
      })

    }).catch((err) => {
      console.log(err.toJSON());
    })
  }

  const refreshChannel = async (godMode, isArchived, data) => {
    let list1 = []
    let list2 = []
    let unread = 0

    axios.get(`https://${process.env.EXPO_PUBLIC_LIVE}/channels?bookmarked=true&claimed=true&limit=999`, {
      headers: {
        'Authorization': data.access_token
      },
    }).then((response) => {

      list1 = response.data.records
      setIsLoading(true)

      axios.get(`https://${process.env.EXPO_PUBLIC_LIVE}/channels?bookmarked=false&claimed=true&limit=999`, {
        headers: {
          'Authorization': data.access_token
        },
      }).then((response) => {

        list2 = response.data.records

        const combined = [...list1, ...list2]

        var result = combined.reduce((unique, o) => {
          if (!unique.some(obj => obj.id == o.id)) {
            unique.push(o);
          }
          return unique;
        }, []);
        result.sort((a, b) => new Date(b.last_response) - new Date(a.last_response));

        result.forEach((channel) => {
          unread += Number(channel.unread)
        })
        console.log(result, " : ReSULT FROM REFRESH")
        setUnreadNumber(unread)
        setArchivedList(result.filter((channel) => channel.archived == true))
        setRegList(result)
        // setClaimedList(result.filter((channel) => channel.claimed_date != null))
        handleUpdateList(godMode, isArchived, result)

        setIsLoading(false)
      }).catch((err) => {
        console.log("CHANNEL DATA ERROR 2: ", err.response.data);

      })


    }).catch((err) => {
      console.log("CHANNEL DATA ERROR 1: ", err.response.data);

    })

  }

  const getChannels = async (data, isBookmarked = undefined, flag = "all", orderBy = false, isUnread = false) => {
    let list1 = []
    let list2 = []
    let unread = 0

    axios.get(`https://${process.env.EXPO_PUBLIC_LIVE}/channels?bookmarked=true&claimed=true&limit=999`, {
      headers: {
        'Authorization': data.access_token
      },
    }).then((response) => {

      list1 = response.data.records
      console.log("CHANNEL DATA BOOKMARKED: ", list1)
      setIsLoading(true)

      axios.get(`https://${process.env.EXPO_PUBLIC_LIVE}/channels?bookmarked=false&claimed=true&limit=999`, {
        headers: {
          'Authorization': data.access_token
        },
      }).then((response) => {

        list2 = response.data.records
        console.log("CHANNEL DATA UNBOOKMARKED: ", list2)

        const combined = [...list1, ...list2]

        var result = combined.reduce((unique, o) => {
          if (!unique.some(obj => obj.id == o.id)) {
            unique.push(o);
          }
          return unique;
        }, []);

        result.sort((a, b) => new Date(b.last_response) - new Date(a.last_response));
        result.forEach((channel) => {
          unread += Number(channel.unread)
        })

        result.push({key: 'spacer'})

        console.log(result, " : ALL DATA CHANNEL DATA")

        if (flag !== "all") {
          result = result.filter((channel) => channel.flag_id == flag)
        }

        if (isBookmarked) {
          result = result.filter((channel) => channel.bookmarked == isBookmarked)
        }

        if (isUnread) {
          result = result.filter((channel) => channel.unread > 0)
        }

        if (orderBy) {
          result = result.reverse()
        }

        setArchivedList(result.filter((channel) => channel.archived == true))
        setRegList(result)
        // setClaimedList(result.filter((channel) => channel.claimed_date != null))
        handleUpdateList(godChecked, archiveChecked, result)
        setUnreadNumber(unread)
        setIsLoading(false)
      }).catch((err) => {
        console.log("CHANNEL ERROR: ", err);

      })


    }).catch((err) => {
      console.log("CHANNEL ERROR: ", err.response);

    })
  }

  const handleUpdateList = (isGodMode, isArchived, channel) => {
    console.log("GOD MODE CHANNEL LIST: ", channelList, " IS ARCHIVED: ", isArchived)
    let temp = channel
    if (isGodMode) {

      getGodChannels(userData)


    } else {
      console.log("REG LIST: ", channel)

      setCurrentList(temp.filter((item) => item.archived == isArchived))


    }

  }

  const handleClaimedFilter = (filter, channel) => {

    let temp = channel
    let temp2 = channelList
    let tempChange = []

    if (filter == "3") {
      setCurrentClaimed(temp.filter((item) => item.archived == true))
    } else if (filter == "2") {
      setCurrentClaimed(temp.filter((item) => item.stop == true))

    } else {
      setCurrentClaimed(temp)
    }


  }


  const getFollowers = async () => {
    const followingRef = await collection(firestore, 'users', userData.id, 'following')
    const q = query(followingRef);
    let temp = []
    const querySnapshot = await getDocs(q);

    // console.log("THE SNAPSHOT: ", querySnapshot)
    if (querySnapshot) {
      querySnapshot.forEach((doc) => {
        console.log("FROM FOLLOWERS: ", doc.data())
        // doc.data() is never undefined for query doc snapshots
        temp.push(doc.id)
      });
    }


    setFollowList(temp)
  }



  return (
    <UserDataContext.Provider
      value={{
        userData, setUserData,
        followList, setFollowList,
        getFollowers, selection,
        setSelection, savedList,
        setSavedList, likedList,
        setLikedList,
        userFlags, setUserFlags,
        getChannels, channelList, setChannelList,
        archivedList, setArchivedList,
        unreadNumber, setUnreadNumber,
        isLoading, setIsLoading,
        getFlags,
        noGodList, setNoGodList,
        currentList, setCurrentList,
        handleUpdateList,
        archiveChecked, setArchiveChecked,
        godChecked, setGodChecked, claimedList, setClaimedList,
        regList, setRegList, refreshChannel, currentClaimed,
        setCurrentClaimed, handleClaimedFilter,
        getUnClaimed, retrieveData, getGodChannels,
        currentFilter, setCurrentFilter, getAllCampaigns, campaigns,
        setCampaigns, recentCampaigns, setRecentCampaigns,
        workspaceUsers, setWorkspaceUsers, isEnabled, setIsEnabled, isAlwaysReplaced, setIsAlwaysReplaced,
        userSettings, setUserSettings, expoPushToken, setExpoPushToken, workspaceCampaigns, setWorkspaceCampaigns,
        getWorkspaceCampaigns, userGroups, setUserGroups,
        getRecentCampaigns, getWorkspaceUsers, getUserSettings, getWorkspaceCampaigns, getUserGroups,
        unread, setUnread, bookmarked, setBookmarked, oldest, setOldest,
        selectedFlag, setSelectedFlag, userBlasts, setUserBlasts, getUserSentBlasts, getContacts, contactList,
        getContactLists, contacts, setContacts, numbers, setNumbers, getWorkspaceNumbers, userRole, setUserRole, getUserPermission,
        blockedNumbers, setBlockedNumbers
      }}
    >
      {props.children}
    </UserDataContext.Provider>
  )
}