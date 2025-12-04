
import { useEffect } from 'react';
// import { HostLivestream, useCall, useCallStateHooks, useIncallManager, VideoRenderer, ViewerLivestream, } from '@stream-io/video-react-native-sdk';
import { View, Button, Text, StyleSheet } from 'react-native';

export const Viewstreamui = () => {
  // Automatically route audio to speaker devices as relevant for watching videos.


  return (
    <View></View>
    // <ViewerLivestream />
    // <View style={styles.flexed}>
    //   <Text style={styles.text}>Live: {totalParticipants}</Text>
    //   <View style={styles.flexed}>{remoteParticipant && <VideoRenderer participant={remoteParticipant} trackType='videoTrack' />}</View>
    //   <View style={styles.bottomBar}>
    //     {isCallLive ? (
    //       <Button onPress={() => call?.stopLive()} title='Stop Livestream' />
    //     ) : (
    //       <Button
    //         onPress={() => {
    //           call?.goLive();
    //         }}
    //         title='Start Livestream'
    //       />
    //     )}
    //   </View>
    // </View>
  );
};

export default Viewstreamui

const styles = StyleSheet.create({
  flexed: {
    flex: 1,
  },
  text: {
    alignSelf: 'center',
    color: 'white',
    backgroundColor: 'blue',
    padding: 6,
    margin: 4,
  },
  bottomBar: {
    alignSelf: 'center',
    margin: 4,
  },
});