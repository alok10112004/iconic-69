const axios = require("axios");

const TENNIS_KEY = process.env.TENNIS_API_KEY;
const TENNIS_URL = process.env.TENNIS_API_URL;

async function fetchTennisLive() {
  try {
    const response = await axios.get(`${TENNIS_URL}/matches`, {
      params: { status: "live" },
      headers: { Authorization: `Bearer ${TENNIS_KEY}` },
    });

    const matches = response.data.matches || response.data.data || [];

    return matches.map((m) => ({
      id: m.id,
      name: `${m.player1?.name || m.player1} vs ${m.player2?.name || m.player2}`,
      teams: [
        m.player1?.name || m.player1 || "Player 1",
        m.player2?.name || m.player2 || "Player 2",
      ],
      venue: m.tournament?.name || m.tournament || "Tennis",
      status: m.status || "Live",
      matchStarted: true,
      matchEnded: false,
      score: [],
    }));
  } catch (error) {
    console.error("Tennis API Error:", error.message);
    return [];
  }
}

module.exports = { fetchTennisLive };