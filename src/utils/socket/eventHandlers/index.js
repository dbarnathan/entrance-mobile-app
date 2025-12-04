export default {
  onConnectionIds
}

function onConnectionIds(data, Socket) {
  console.log(data);
  Socket.socketId = data.socketId;
  Socket.clientId = data.clientId;
}