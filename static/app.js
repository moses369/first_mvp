
async function sendReq(url, options, consoleMsg) {
  try {
    const res = await fetch(url, options);
    if (res.status >= 200 && res.status < 300) {
      const data = await res.json();
      console.log(consoleMsg, data);
      return data;
    } else {
      const body = await res.text();
      console.error("STATUS CODE", res.status, "\nRESPONSE:", body);
    }
  } catch (err) {
    console.error(err);
  }
}
