const axios = require("axios");

const API_KEY = process.env.CRICKET_API_KEY;
const BASE_URL = "https://api.cricapi.com/v1";

async function fetchLiveMatches() {
  try {
    const response = await axios.get(`${BASE_URL}/currentMatches`, {
      params: { apikey: API_KEY, offset: 0 },
    });

    if (response.data.status !== "success") {
      console.log("API Error:", response.data);
      return [];
    }

    return response.data.data || [];
  } catch (error) {
    console.error("Cricket API Error:", error.message);
    return [];
  }
}

module.exports = { fetchLiveMatches };