async function sendReq(url, options) {
  try {
    const res = await fetch(url, options);
    if (res.status >= 200 && res.status < 300) {
      const data = await res.json();
      return data;
    } else {
      const body = await res.text();
      console.error("STATUS CODE", res.status, "\nRESPONSE:", body);
    }
  } catch (err) {
    console.error(err);
  }
}

$('.meat').on('click',async e =>{

  const data = await sendReq('/api/products?filter.term=meat&filter.limit=5')
  console.log(data);
  
})