export default function Deserialize(data) {
  if (typeof data === 'string') {
    return HandleStringData(data);
  }

  if (data instanceof ArrayBuffer) {
    return HandleArrayBufferData(data);
  }
}

function HandleStringData(str) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return data;
  }
}

function HandleArrayBufferData(data) {
  const decoder = new TextDecoder('utf-8');
  const unint8Array = new Uint8Array(data);
  const decodedString = decoder.decode(unint8Array);
  
  return HandleStringData(decodedString);
}

function HandleBlobData(data) {
  const reader = new FileReader();

  reader.onload = () => {
    return HandleStringData(reader.result);
  };

  reader.readAsText(data);
}