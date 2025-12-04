const getKilobyteSize = ({ str }) => {
  const byteLength = new Blob([str]).size;
  const kilobytes = (byteLength / 1024).toFixed(2);
  return `${kilobytes}KB`;
};

const url = `https://${process.env.EXPO_PUBLIC_LIVE}`
const defaultHeader = {
  "Content-Type": "application/json",
  "Accept": "application/json",
}

export const request = async (method, path, data, customHeaders) => {
  const formattedUrl = `${url}${path}`;
  const headers = customHeaders || defaultHeader;
  const config = {};

  if (token) {
    headers.Authorization = token;
  }

  config.method = method;
  config.url = formattedUrl;
  config.headers = headers;

  if (data) {
    config.data = data;
  }

  const result = await axios(config)
    .then(res => { 
      console.log(res.data, " : Refresh Success")
    }).catch((err) => {
      console.log(" Error : ", err.response.data);
    })

    return result;
}

export { getKilobyteSize }