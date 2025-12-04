import MakeEntranceWebsocket from '@entrancegrp/websockets';
import { UserDataContext } from '../context/UserDataContext';
import { useContext } from 'react';


const socketConfigs = {
    url: "wss://sck.beta.entrancegrp.com",
    logging: true,
    callbackTimout: 60000,
    onConnect: Authenticate
}




export const socket = MakeEntranceWebsocket(socketConfigs)


export function Authenticate(err, isConnected, token) {


    console.log('Authenticatin...: ', token);

    socket.Subscribe('CHANNEL_EVENT', (data) => {
        console.log(
            "DATA FROM WEBSOCKET CHANNEL: ", data
        )
    })

    socket.Subscribe('MESSAGE_EVENT', (data) => {
        console.log(
          "DATA FROM WEBSOCKET MESSAGE: ", data
        )
    
      })
    console.log("Authenticate Successful: ", isConnected);

    socket.Send(socket.EVENTS.AUTHENTICATE, { token: token});

}


