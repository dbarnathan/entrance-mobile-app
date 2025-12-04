
import { useEffect } from 'react';
import { HostLivestream, useCall, useCallStateHooks, useIncallManager, VideoRenderer} from '@stream-io/video-react-native-sdk';
import { View, Button, Text, StyleSheet } from 'react-native';

export const Livestreamui = () => {
  const call = useCall();

  const { useParticipantCount, useLocalParticipant, useIsCallLive } = useCallStateHooks();

  const totalParticipants = useParticipantCount();
  const localParticipant = useLocalParticipant();
  const isCallLive = useIsCallLive();

  // Automatically route audio to speaker devices as relevant for watching videos.
  useIncallManager({ media: 'video', auto: true });
  useEffect(()  => {
    console.log("ID LIVE: ", localParticipant)
  }, [])

  return (

    <View style={styles.flexed}>
      <Text style={styles.text}>Live: {totalParticipants}</Text>
      <View style={styles.flexed}>{localParticipant && <VideoRenderer participant={localParticipant} trackType='videoTrack' />}</View>
      <View style={styles.bottomBar}>
        {isCallLive ? (
          <Button onPress={() => call?.stopLive()} title='Stop Livestream' />
        ) : (
          <Button
            onPress={() => {
              call?.goLive();
            }}
            title='Start Livestream'
          />
        )}
      </View>
    </View>
  );
};

export default Livestreamui

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