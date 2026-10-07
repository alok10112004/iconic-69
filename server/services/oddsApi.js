const axios = require("axios");
const OddsCache = require("../models/OddsCache");

const ODDS_API_KEY = process.env.ODDS_API_KEY;
const BASE_URL = "https://api.the-odds-api.com/v4";

const SPORT_KEYS = {
  cricket: "cricket_ipl",
  football: "soccer_epl",
  tennis: "tennis_atp_aus_open",
};

// Cache duration: 15 minutes
const CACHE_DURATION = 15 * 60 * 1000;

async function fetchOddsFromApi(sport, region = "uk,eu") {
  try {
    const sportKey = SPORT_KEYS[sport];
    if (!sportKey) return [];

    const response = await axios.get(
      `${BASE_URL}/sports/${sportKey}/odds`,
      {
        params: {
          apiKey: ODDS_API_KEY,
          regions: region,
          markets: "h2h",
          oddsFormat: "decimal",
        },
      }
    );

    return response.data || [];
  } catch (error) {
    console.error("Odds API Error:", error.message);
    return [];
  }
}

// Cached odds lo
async function fetchOdds(sport) {
  try {
    const cached = await OddsCache.findOne({ sport });
    const now = Date.now();

    // Agar cache fresh hai (15 min se kam purana)
    if (cached && now - new Date(cached.updatedAt).getTime() < CACHE_DURATION) {
      console.log(`✅ Using cached odds for ${sport}`);
      return cached.data;
    }

    // Warna naya fetch karo
    console.log(`🔄 Fetching fresh odds for ${sport}`);
    const freshData = await fetchOddsFromApi(sport);

    // Cache update karo
    await OddsCache.findOneAndUpdate(
      { sport },
      { data: freshData, updatedAt: new Date() },
      { upsert: true }
    );

    return freshData;
  } catch (error) {
    console.error("Cache Error:", error.message);
    return [];
  }
}

// Match ke saath odds merge karo
function findOddsForMatch(oddsData, teamA, teamB) {
  if (!oddsData || oddsData.length === 0) return null;

  const match = oddsData.find(
    (o) =>
      (o.home_team?.toLowerCase().includes(teamA?.toLowerCase()) ||
        o.away_team?.toLowerCase().includes(teamA?.toLowerCase())) &&
      (o.home_team?.toLowerCase().includes(teamB?.toLowerCase()) ||
        o.away_team?.toLowerCase().includes(teamB?.toLowerCase()))
  );

  if (!match || !match.bookmakers || match.bookmakers.length === 0) return null;

  const bookmaker = match.bookmakers[0];
  const h2h = bookmaker.markets?.find((m) => m.key === "h2h");
  if (!h2h) return null;

  const outcomeA = h2h.outcomes.find((o) =>
    o.name.toLowerCase().includes(teamA?.toLowerCase())
  );
  const outcomeB = h2h.outcomes.find((o) =>
    o.name.toLowerCase().includes(teamB?.toLowerCase())
  );

  if (!outcomeA || !outcomeB) return null;

  return {
    back: {
      teamA: outcomeA.price,
      teamB: outcomeB.price,
    },
    lay: {
      teamA: (outcomeA.price + 0.1).toFixed(2),
      teamB: (outcomeB.price + 0.1).toFixed(2),
    },
    bookmaker: bookmaker.title,
  };
}

module.exports = { fetchOdds, findOddsForMatch };