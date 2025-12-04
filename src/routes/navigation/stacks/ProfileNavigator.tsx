import React, { useContext } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { ColorSchemeContext } from '../../../context/ColorSchemeContext'
import { lightProps, darkProps } from './navigationProps/navigationProps'
import HeaderStyle from './headerComponents/HeaderStyle'
import Profile from '../../../scenes/Profile'
import UserSettings from '../../../scenes/UserSettings'
import { Platform, SafeAreaView, StatusBar } from 'react-native'
import Settings from '../../../scenes/Settings'
import UserBlasts from '../../../scenes/UserBlasts'
import Workspace from '../../../scenes/Workspace'
import Users from '../../../scenes/Workspace/Users'
import EditWorkspaceUser from '../../../scenes/Workspace/Users/EditWorkspaceUser'
import InviteUsers from '../../../scenes/Workspace/Users/InviteUsers'
import UserGroups from '../../../scenes/Workspace/Users/UserGroups'
import Flags from '../../../scenes/Workspace/Flags'
import Numbers from '../../../scenes/Workspace/Numbers'
import BlockedNumbers from '../../../scenes/Workspace/BlockedNumbers'
import Billing from '../../../scenes/Workspace/Billing'
import WorkspaceSettings from '../../../scenes/Workspace/WorkspaceSettings'
import MessageManager from '../../../scenes/Workspace/MessageManager'
import Api from '../../../scenes/Workspace/Api'
import DLC from '../../../scenes/Workspace/DLC'
import WorkspaceLogs from '../../../scenes/Workspace/Logs'
import { UserDataContext } from '../../../context/UserDataContext'

const Stack = createStackNavigator()
const RootStack = createStackNavigator()

export const ProfileNavigator = () => {
  const { scheme } = useContext(ColorSchemeContext)
  const {userRole} = useContext(UserDataContext)
  const navigationProps = scheme === 'dark' ? darkProps : lightProps
  return (
    <>
      {
        Platform.OS === "ios" ?
          <SafeAreaView style={Platform.OS == "ios" ? { flex: .01, backgroundColor: "white" } : { flex: 0.06 }}>
            <StatusBar barStyle="dark-content" backgroundColor="white" />
          </SafeAreaView> : <StatusBar barStyle="dark-content" backgroundColor="white" />
      }


      <Stack.Navigator

        screenOptions={{

        }}
     >
        <Stack.Screen
          name="ProfileStack"
          component={userRole == "user" ? UserSettings : Profile}
          options={() => ({
            headerShown: false
          })}

        />
        <Stack.Screen
          name="SettingsStack"
          component={Settings}
          options={() => ({
            headerShown: false
          })}

        />
        <Stack.Screen
          name="UserBlastsStack"
          component={UserBlasts}
          options={() => ({
            headerShown: false
          })}

        />
        <Stack.Screen
          name="WorkspaceStack"
          component={Workspace}
          options={() => ({
            headerShown: false
          })}

        />
        <Stack.Screen
          name="Users"
          component={Users}
          options={() => ({
            headerShown: false
          })}

        />
        <Stack.Screen
          name="EditWorkspace"
          component={EditWorkspaceUser}
          options={() => ({
            headerShown: false
          })}

        />
        <Stack.Screen
          name="InviteUsers"
          component={InviteUsers}
          options={() => ({
            headerShown: false
          })}

        />

        <Stack.Screen
          name="UserGroups"
          component={UserGroups}
          options={() => ({
            headerShown: false
          })}

        />


        <Stack.Screen
          name="Flags"
          component={Flags}
          options={() => ({
            headerShown: false
          })}

        />

        <Stack.Screen
          name="Numbers"
          component={Numbers}
          options={() => ({
            headerShown: false
          })}

        />

        <Stack.Screen
          name="BlockedNumbers"
          component={BlockedNumbers}
          options={() => ({
            headerShown: false
          })}

        />
        <Stack.Screen
          name="Billing"
          component={Billing}
          options={() => ({
            headerShown: false
          })}

        />

        <Stack.Screen
          name="WorkspaceSettings"
          component={WorkspaceSettings}
          options={() => ({
            headerShown: false
          })}

        />
        <Stack.Screen
          name="MessageManagement"
          component={MessageManager}
          options={() => ({
            headerShown: false
          })}

        />
        <Stack.Screen
          name="API"
          component={Api}
          options={() => ({
            headerShown: false
          })}

        />
        <Stack.Screen
          name="10DLC"
          component={DLC}
          options={() => ({
            headerShown: false
          })}

        />
        <Stack.Screen
          name="Logs"
          component={WorkspaceLogs}
          options={() => ({
            headerShown: false
          })}

        />

      </Stack.Navigator>
    </>
  )
}