export default {
  SerializeJsonEventPacket,
  SerializeBinaryPacket
}

function SerializeJsonEventPacket(ServerEvent, fnId, rawData) {
  const data = {};

  data.event = ServerEvent.event;
  data.action = ServerEvent.action;
  data.fnId = fnId;

  if (rawData) {
    data.data = rawData;
  }

  return JSON.stringify(data);
}

function SerializeBinaryPacket(event, rawData) {
  const data = {};

  data.event = event;

  if (data) {
    data.data = rawData;
  }

  return data;
}