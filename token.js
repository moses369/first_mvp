import fetch from "node-fetch";
import btoa from "btoa";
import dotenv from "dotenv";
dotenv.config();
const { API_CLIENT_USER, API_CLIENT_SECRET } = process.env;
const token = (async () => {
  try {
    const tokenHeaders = {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(`${API_CLIENT_USER}:${API_CLIENT_SECRET}`)}`,
    };
    const res = await fetch("https://api.kroger.com/v1/connect/oauth2/token", {
      method: "POST",
      headers: tokenHeaders,
      body: "grant_type=client_credentials&scope=product.compact",
    });
    const token = await res.json();
    return token
  } catch (err) {
    console.error(err);
  }
})();
export default token