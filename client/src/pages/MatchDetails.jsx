import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import BetSlip from "../components/BetSlip";

function MatchDetails() {
  const { sport, id } = useParams();
  const navigate = useNavigate();
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBet, setSelectedBet] = useState(null);

  const fetchMatch = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/matches/details/${sport}/${id}`);
      if (res.data.success) {
        setMatch(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatch();
    const interval = setInterval(fetchMatch, 30000);
    return () => clearInterval(interval);
  }, [sport, id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-xl text-gray-400">Loading match...</div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-red-500 mb-4">Match not found</p>
          <button
            onClick={() => navigate("/")}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-white"
          >
            Back to Matches
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate("/")}
          className="mb-4 text-gray-400 hover:text-white text-sm"
        >
          ← Back to Matches
        </button>

        <div className="bg-red-600 text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
          <div>
            <h1 className="text-lg font-bold">{match.name}</h1>
            <p className="text-xs text-red-100">{match.venue}</p>
          </div>
          <span className="text-xs bg-black/40 px-3 py-1 rounded font-bold">
            {match.matchEnded ? "FINISHED" : match.matchStarted ? "LIVE" : "UPCOMING"}
          </span>
        </div>

        <div className="bg-gray-900 border border-red-500/20 border-t-0 px-4 py-3">
          <p className="text-red-400 font-semibold">{match.status}</p>
        </div>

        {match.score && match.score.length > 0 && (
          <div className="bg-gray-900 border border-red-500/20 border-t-0 p-4">
            <h2 className="text-sm font-bold text-red-400 mb-3">
              📊 SCORECARD
            </h2>
            <div className="space-y-2">
              {match.score.map((s, i) => (
                <div
                  key={i}
                  className="bg-black rounded p-3 flex justify-between items-center border border-red-500/10"
                >
                  <span className="text-sm text-gray-300">{s.inning}</span>
                  <span className="font-bold text-lg text-white">
                    {s.r}/{s.w}
                    <span className="text-sm text-gray-400 font-normal">
                      {" "}
                      ({s.o} ov)
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-gray-900 border border-red-500/20 border-t-0 rounded-b-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-red-500 text-lg">★</span>
            <span className="font-bold text-sm text-red-400">MATCH ODDS</span>
            {match.odds?.bookmaker && (
              <span className="text-xs text-gray-500 ml-auto">
                {match.odds.bookmaker}
              </span>
            )}
          </div>

          <div className="grid grid-cols-[1fr_100px_100px] gap-2 mb-2">
            <div className="bg-gray-800 rounded px-3 py-1 text-sm text-gray-400 text-center">
              Cashout
            </div>
            <div className="text-center font-bold text-sm text-gray-300">
              BACK
            </div>
            <div className="text-center font-bold text-sm text-gray-300">
              LAY
            </div>
          </div>

          <div className="grid grid-cols-[1fr_100px_100px] gap-2 mb-2 items-center">
            <div className="px-3 py-2 font-semibold text-sm text-white">
              {match.teams?.[0]}
            </div>
            <button
              onClick={() =>
                setSelectedBet({
                  match,
                  pick: "A",
                  pickName: match.teams?.[0],
                  odds: match.odds?.back?.teamA || 1.8,
                })
              }
              className="bg-blue-500 hover:bg-blue-600 rounded py-2 text-center"
            >
              <div className="font-bold text-lg text-white">
                {match.odds?.back?.teamA || "1.8"}
              </div>
            </button>
            <button
              onClick={() =>
                setSelectedBet({
                  match,
                  pick: "A",
                  pickName: match.teams?.[0],
                  odds: match.odds?.lay?.teamA || 1.9,
                })
              }
              className="bg-pink-500 hover:bg-pink-600 rounded py-2 text-center"
            >
              <div className="font-bold text-lg text-white">
                {match.odds?.lay?.teamA || "1.9"}
              </div>
            </button>
          </div>

          <div className="grid grid-cols-[1fr_100px_100px] gap-2 items-center">
            <div className="px-3 py-2 font-semibold text-sm text-white">
              {match.teams?.[1]}
            </div>
            <button
              onClick={() =>
                setSelectedBet({
                  match,
                  pick: "B",
                  pickName: match.teams?.[1],
                  odds: match.odds?.back?.teamB || 2.1,
                })
              }
              className="bg-blue-500 hover:bg-blue-600 rounded py-2 text-center"
            >
              <div className="font-bold text-lg text-white">
                {match.odds?.back?.teamB || "2.1"}
              </div>
            </button>
            <button
              onClick={() =>
                setSelectedBet({
                  match,
                  pick: "B",
                  pickName: match.teams?.[1],
                  odds: match.odds?.lay?.teamB || 2.2,
                })
              }
              className="bg-pink-500 hover:bg-pink-600 rounded py-2 text-center"
            >
              <div className="font-bold text-lg text-white">
                {match.odds?.lay?.teamB || "2.2"}
              </div>
            </button>
          </div>
        </div>

        <div className="mt-4 bg-gray-900 border border-red-500/20 rounded-lg p-4">
          <h2 className="text-sm font-bold text-red-400 mb-3">ℹ️ MATCH INFO</h2>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-gray-400 text-xs">Sport</p>
              <p className="text-white capitalize">{sport}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Venue</p>
              <p className="text-white">{match.venue || "TBD"}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Date</p>
              <p className="text-white">{match.date || "TBD"}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Status</p>
              <p className="text-white">{match.status || "Live"}</p>
            </div>
          </div>
        </div>
      </div>

      {selectedBet && (
        <BetSlip
          match={selectedBet.match}
          pick={selectedBet.pick}
          pickName={selectedBet.pickName}
          odds={selectedBet.odds}
          onClose={() => setSelectedBet(null)}
          onSuccess={() => alert("Bet placed successfully!")}
        />
      )}
    </div>
  );
}

export default MatchDetails;