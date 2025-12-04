
// Enumerations
import SocketStates from './enums/socketStates';
import SocketEvents from './enums/socketEvents';

import Deserialize from './library/deserialize';
import Serialize from './library/serialize';
import DeepFreeze from './library/deepFreeze';
import WebsocketError from './library/websocketError';

import SocketEventHandlers from './eventHandlers/index';
import ServerEvents from './enums/serverEvents';

export default function MakeEntranceWebsocket(config) {
  const Socket = {};
  const CallbackHandlers = {};
  const CustomServerEvents = config.customServerEvents || {};

  let connectionAttempts = 0;
  let connectionTimeout = null;
  let connectionError = null;

  Socket.socketId = null;
  Socket.ws = null;
  Socket.state = SocketStates.READY;
  Socket.subscriptions = {};

  HandleLog('ready for connection')

  return DeepFreeze({
    EVENTS: {...CustomServerEvents, ...ServerEvents },
    CreateEvent,
    Connect,
    Destroy,
    Subscribe,
    Unsubscribe,
    Send
  });

  async function Connect(parameters) {
    if (!config.url) {
      OutputError('No url provided for connection');
      return;
    }

    connectionAttempts++;

    Socket.ws = new WebSocket(config.url);
    Socket.state = SocketStates.CONNECTING;
    Socket.socketId = null;
    Socket.clientId = null;

    Socket.ws.addEventListener('open', onOpen);
    Socket.ws.addEventListener('message', onMessage);
    Socket.ws.addEventListener('close', onClose);
    Socket.ws.addEventListener('error', onError);

    HandleLog('socket Connecting to url: ' + config.url);
    HandleLog('connection attempts: ' + connectionAttempts);

    while(!Socket.socketId && Socket.state !== SocketStates.ERROR) {
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (Socket.socketId) {
        clearTimeout(connectionTimeout);
        Socket.state = SocketStates.CONNECTED;
      }
    }

    if (Socket.state === SocketStates.CONNECTED) {
      HandleLog('socket connected');
      HandleConfigHandlers(config.onConnect, false, true, parameters);
      return true;
    }


    if (connectionAttempts < 3) {
      Clear();
      Connect(callback);
      return;
    }

    if (config.onConnect) {
      HandleConfigHandlers(config.onConnect, connectionError, false, parameters);
    } else if (config.logging) {    
      throw new WebsocketError(connectionError.error, connectionError.message);
    }
  }

  function HandleConfigHandlers(config, arg1, arg2, arg3) {
    if (!config) return;

    if (typeof config === 'function') {
      config(arg1, arg2, arg3);
      return;
    }

    if (typeof config.handler === 'function') {
      config.handler(arg1, arg2, config.parameters);
      return;
    }
  }

  function Destroy() {
    Clear();

    try {
      Socket.ws.close();
    } catch (e) {
      OutputError('Error closing socket: ' + e);
    }

    Socket.ws = null;
    Socket.state = null;
    Socket.subscriptions = null;
    Socket.socketId = null;

    connectionAttempts = null;

    HandleLog('socket destroyed');
  }

  function Clear() {
    connectionError = null;
    clearTimeout(connectionTimeout);

    Socket.ws.removeEventListener('open', onOpen);
    Socket.ws.removeEventListener('message', onMessage);
    Socket.ws.removeEventListener('close', onClose);
    Socket.ws.removeEventListener('error', onError);
  }

  async function onMessage(e) {
    const deserializedData = await Deserialize(e.data);
    const socketEvent = deserializedData?.event || null;
    const socketSubEvent = deserializedData?.subEvent || null;
    let eventHandler = null;

    HandleLog('Socket Event: ' + socketEvent + ', Action: ', socketSubEvent);
     
    if (SocketEvents[socketEvent]) {
      eventHandler = SocketEvents[socketEvent];
      SocketEventHandlers[eventHandler](deserializedData.data, Socket);
      HandleLog('Socket Event: ' + socketEvent + ', data:', deserializedData);
      return
    }

    config.onMessage && !deserializedData.callbackId ? config.onMessage(deserializedData) : null;

    if (Socket.subscriptions[socketEvent]) {
      HandleSubscriptionEvents(Socket.subscriptions[socketEvent], socketSubEvent, deserializedData);
      HandleLog('Subscription Event: ' + socketEvent + ', data: ' + deserializedData);
      return;
    } 

    if (deserializedData.fnId) {
      HandleLog('incoming message callback handled: ', deserializedData);

      if (CallbackHandlers[deserializedData.fnId]) {
        clearTimeout(CallbackHandlers[deserializedData.fnId].timeout);
        CallbackHandlers[deserializedData.fnId].callback(deserializedData.data);
        delete CallbackHandlers[deserializedData.fnId];
      } else {
        OutputError('No callback handler found for incoming data: ', deserializedData);
      }

      return;
    }
    
    OutputError('no event handling: ', deserializedData);
  }

  function HandleSubscriptionEvents(subscriptions, subevent, deserializedData) {
    const handlers = subscriptions[subevent] || subscriptions;

    for (let handler of handlers) {
      try {
        handler(deserializedData);
      } catch (e) {
        OutputError('Error handling subscription event: ' + subevent + ', error: ' + e);
      }
    }
  }

  function onOpen() {
    connectionTimeout = setTimeout(HandleConnectionTimeout, 10000);

    if (config.onOpen) {
      config.onOpen();
    }
  }

  function HandleConnectionTimeout() {
    if (!Socket.socketId) {
      Socket.state = SocketStates.ERROR;
      Socket.ws.close();

      connectionAttempts > 2
        ? connectionError = { error: 'ConnectionTimeout', message: 'Unable to establish connection' }
        : Connect();
    }
  }

  function onClose(e) {
    if (Socket.state !== SocketStates.ERROR) {
      Socket.state = SocketStates.DISCONNECTED;
    }

    if (config.onClose) {
      config.onClose(e)
    }

    HandleLog('socket disconnected');
  }

  function onError(e) {
    Socket.state = SocketStates.ERROR;

    config.onError
      ? config.onError(e)
      : OutputError(e);
  }

  function Send(arg1, arg2, arg3) {
    let serializedData = null;
    let callbackId = null;
    let callback = typeof arg2 === 'function' ? arg2 : arg3;
    let data = arg1.event ? arg2 : arg1;
    let ServerEvent = arg2 && arg2.event ? arg2 : arg1.event ? arg1 : null;

    if (Socket.state !== SocketStates.CONNECTED) {
      OutputError('Socket is not connected');
      return false;
    }

    if (callback && typeof callback === 'function') {
      callbackId = Date.now().toString();
      CallbackHandlers[callbackId] = {};
      CallbackHandlers[callbackId].callback = callback;
      CallbackHandlers[callbackId].timeout = setTimeout(
        () => {
          delete CallbackHandlers[callbackId];
          throw new Error('Websocket service timed out')
        },
        config.callbackTimeout || 60000
      );
    }

    serializedData = Serialize.SerializeJsonEventPacket(ServerEvent, callbackId, data);

    Socket.ws.send(serializedData)

    return true
  }

  function Subscribe(event, callback) {
    if (!Socket.subscriptions[event]) {
      Socket.subscriptions[event] = [];
    }

    Socket.subscriptions[event].push(callback);
    HandleLog('Subscribed to event: ' + event + ', callback: ' + callback.name);
  }

  function Unsubscribe(event, arg1, arg2) {
    if (!Socket.subscriptions[event]) {
      OutputError('No subscriptions found for event:' + event)
      return;
    }

    if (arg1 && arg2) {

    }

    if (!callback) {
      OutputError('No callback provided for event: ' + event);
      return
    }

    for (let i = 0; i < Socket.subscriptions[event].length; i++) {
      if (Socket.subscriptions[event][i] === callback) {
        Socket.subscriptions[event].splice(i, 1);
        HandleLog('Unsubscribed from event: ' + event + ', callback: ' + callback.name);
      }
    }

    if (!Socket.subscriptions[event].length) {
      delete Socket.subscriptions[event];
      HandleLog('No more subscriptions for event: ' + event);
    }
  }

  function HandleLog(message, data) {
    if (!config.logging) return

    console.log('WEBSOCKET LOG -', message);

    if (data) {
      console.log(data);
    }
  }

  function OutputError(message, data) {
    if (!config.logging) return

    console.error('WEBSOCKET ERROR - ', message);

    if (data) {
      console.error(data);
    }
  }

  function CreateEvent(event, action) {
    return { event, action };
  }
}

