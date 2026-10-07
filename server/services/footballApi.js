const axios = require("axios");

const API_KEY = process.env.FOOTBALL_API_KEY;
const BASE_URL = process.env.FOOTBALL_API_URL;

async function fetchFootballLive() {
  try {
    const response = await axios.get(`${BASE_URL}/fixtures`, {
      params: { live: "all" },
      headers: { "x-apisports-key": API_KEY },
    });

    const fixtures = response.data.response || [];

    return fixtures.map((f) => ({
      id: f.fixture?.id,
      name: `${f.teams?.home?.name} vs ${f.teams?.away?.name}`,
      teams: [f.teams?.home?.name, f.teams?.away?.name],
      venue: f.fixture?.venue?.name || "TBD",
      status: `${f.fixture?.status?.short || ""} - ${f.goals?.home ?? 0}-${f.goals?.away ?? 0}`,
      matchStarted: true,
      matchEnded: ["FT", "AET", "PEN"].includes(f.fixture?.status?.short),
      score: [],
    }));
  } catch (error) {
    console.error("Football API Error:", error.message);
    return [];
  }
}

module.exports = { fetchFootballLive };