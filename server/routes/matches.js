const express = require("express");
const router = express.Router();
const { fetchLiveMatches } = require("../services/cricketApi");
const { fetchFootballLive } = require("../services/footballApi");
const { fetchTennisLive } = require("../services/tennisApi");
const { fetchOdds, findOddsForMatch } = require("../services/oddsApi");
const Match = require("../models/Match");

// Helper: matches mein odds add karo
async function addOddsToMatches(matches, sport) {
  try {
    const oddsData = await fetchOdds(sport);

    return matches.map((m) => {
      const teamA = m.teams?.[0] || m.teamA;
      const teamB = m.teams?.[1] || m.teamB;
      const odds = findOddsForMatch(oddsData, teamA, teamB);

      return {
        ...m,
        odds: odds || {
          back: { teamA: 1.8, teamB: 2.1 },
          lay: { teamA: 1.9, teamB: 2.2 },
          bookmaker: "Demo",
        },
      };
    });
  } catch (error) {
    console.error("Odds merge error:", error.message);
    return matches.map((m) => ({
      ...m,
      odds: {
        back: { teamA: 1.8, teamB: 2.1 },
        lay: { teamA: 1.9, teamB: 2.2 },
        bookmaker: "Demo",
      },
    }));
  }
}

// Cricket
router.get("/cricket", async (req, res) => {
  try {
    const data = await fetchLiveMatches();
    const withOdds = await addOddsToMatches(data, "cricket");
    res.json({ success: true, data: withOdds });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Football
router.get("/football", async (req, res) => {
  try {
    const data = await fetchFootballLive();
    const withOdds = await addOddsToMatches(data, "football");
    res.json({ success: true, data: withOdds });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Tennis
router.get("/tennis", async (req, res) => {
  try {
    const data = await fetchTennisLive();
    const withOdds = await addOddsToMatches(data, "tennis");
    res.json({ success: true, data: withOdds });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Backward compatibility
router.get("/live", async (req, res) => {
  const data = await fetchLiveMatches();
  res.json({ success: true, data });
});

// DB matches
router.get("/", async (req, res) => {
  const matches = await Match.find().sort({ startTime: 1 });
  res.json({ success: true, data: matches });
});

module.exports = router;