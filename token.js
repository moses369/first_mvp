import fetch from 'node-fetch';
import btoa from 'btoa';
const token = (async () => {
   try {
     const tokenHeaders ={
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization":`Basic ${btoa(
         "firststore-d26c190990b4cfe3a6cb5994c78d98c13589844736430073127:5lCnQ74LlibedjKMhi9XK2gb5OllDIkyrp7VXwdU"
       )}`
     }
     const res = await fetch("https://api.kroger.com/v1/connect/oauth2/token", {
       method: "POST",
       headers: tokenHeaders,
       body: "grant_type=client_credentials",
     });
     const token = await res.json();
     const { access_token } = token;
     return access_token;
   } catch (err) {
     console.error(err);
   }
 })();


 export default token