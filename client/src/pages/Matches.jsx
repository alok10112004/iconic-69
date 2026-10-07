import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import BetSlip from "../components/BetSlip";

function Matches() {
  const [sport, setSport] = useState("cricket");
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBet, setSelectedBet] = useState(null);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`/api/matches/${sport}`);
      if (res.data.success) {
        setMatches(res.data.data || []);
      }
    } catch (err) {
      console.error(err);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sport !== "casino") {
      fetchMatches();
      const interval = setInterval(fetchMatches, 30000);
      return () => clearInterval(interval);
    }
  }, [sport]);

  const sports = [
    { id: "cricket", label: "🏏 Cricket" },
    { id: "football", label: "⚽ Football" },
    { id: "tennis", label: "🎾 Tennis" },
    { id: "casino", label: "🎰 Casino" },
  ];

  const casinoGames = [
    {
      id: "dice",
      name: "Dice",
      icon: "🎲",
      path: "/casino",
      desc: "Roll under/over",
    },
    {
      id: "mines",
      name: "Mines",
      icon: "💣",
      path: "/mines",
      desc: "Find safe tiles",
    },
    {
      id: "plinko",
      name: "Plinko",
      icon: "🎯",
      path: "/plinko",
      desc: "Drop the ball",
    },
    {
      id: "coinflip",
      name: "Coin Flip",
      icon: "🪙",
      path: "/coinflip",
      desc: "Heads or Tails",
    },
    {
      id: "roulette",
      name: "Roulette",
      icon: "🎡",
      path: "/roulette",
      desc: "Spin the wheel",
    },
    {
      id: "crash",
      name: "Crash",
      icon: "✈️",
      path: "/crash",
      desc: "Cash out before crash",
    },
  ];

  return (
    <div className="min-h-screen relative p-4 bg-gradient-to-br from-black via-red-950/20 to-black">
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, red 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      ></div>

      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {sports.map((s) => (
            <button
              key={s.id}
              onClick={() => setSport(s.id)}
              className={`px-4 py-2 rounded font-semibold transition ${
                sport === s.id
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/50"
                  : "bg-gray-900/80 backdrop-blur text-gray-300 hover:bg-gray-800 border border-red-500/20"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Casino View */}
        {sport === "casino" && (
          <div>
            <h2 className="text-2xl font-bold text-red-500 mb-4">
              🎰 Casino Games
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {casinoGames.map((game) => (
                <Link
                  key={game.id}
                  to={game.path}
                  className="bg-gray-900/80 backdrop-blur rounded-lg p-6 border border-red-500/30 hover:border-red-500 transition text-center hover:scale-105 transform duration-200"
                >
                  <div className="text-5xl mb-3">{game.icon}</div>
                  <h3 className="font-bold text-white text-lg mb-1">
                    {game.name}
                  </h3>
                  <p className="text-xs text-gray-400">{game.desc}</p>
                </Link>
              ))}
            </div>

            <div className="mt-6 bg-gray-900/80 backdrop-blur rounded-lg p-4 border border-red-500/20">
              <p className="text-center text-gray-400 text-sm">
                🎰 Aur games jald aa rahe hain — Teen Patti, Baccarat, Keno
              </p>
            </div>
          </div>
        )}

        {/* Sports View */}
        {sport !== "casino" && (
          <>
            {loading ? (
              <div className="text-center text-gray-400 py-12">
                Loading {sport}...
              </div>
            ) : matches.length === 0 ? (
              <div className="text-gray-400 bg-gray-900/80 backdrop-blur rounded-lg p-6 text-center border border-red-500/20">
                No {sport} matches available right now
              </div>
            ) : (
              <div className="space-y-4">
                {matches.map((match, idx) => (
                  <div
                    key={match.id || idx}
                    className="bg-gray-900/80 backdrop-blur rounded-lg border border-red-500/20 overflow-hidden hover:border-red-500/50 transition"
                  >
                    <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 flex justify-between items-center">
                      <span className="font-semibold text-sm truncate pr-2">
                        {match.name}
                      </span>
                      <span className="text-xs bg-black/40 px-2 py-0.5 rounded whitespace-nowrap">
                        LIVE
                      </span>
                    </div>

                    <div className="px-4 pt-2 text-xs text-gray-400">
                      {match.venue}
                    </div>
                    <div className="px-4 pb-2 text-xs text-red-300">
                      {match.status}
                    </div>

                    <div className="p-3 border-t border-red-500/10">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-red-500 text-lg">★</span>
                        <span className="font-bold text-sm text-red-400">
                          MATCH ODDS
                        </span>
                        {match.odds?.bookmaker && (
                          <span className="text-xs text-gray-500 ml-auto">
                            {match.odds.bookmaker}
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-[1fr_80px_80px] sm:grid-cols-[1fr_100px_100px] gap-2 mb-1">
                        <div className="bg-gray-800/60 rounded px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-400 text-center">
                          Cashout
                        </div>
                        <div className="text-center font-bold text-xs sm:text-sm text-gray-300">
                          BACK
                        </div>
                        <div className="text-center font-bold text-xs sm:text-sm text-gray-300">
                          LAY
                        </div>
                      </div>

                      <div className="grid grid-cols-[1fr_80px_80px] sm:grid-cols-[1fr_100px_100px] gap-2 mb-1 items-center">
                        <div className="px-2 sm:px-3 py-2 font-semibold text-xs sm:text-sm text-white truncate">
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
                          className="bg-blue-500 hover:bg-blue-600 rounded py-1 sm:py-2 text-center transition"
                        >
                          <div className="font-bold text-sm sm:text-lg text-white">
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
                          className="bg-pink-500 hover:bg-pink-600 rounded py-1 sm:py-2 text-center transition"
                        >
                          <div className="font-bold text-sm sm:text-lg text-white">
                            {match.odds?.lay?.teamA || "1.9"}
                          </div>
                        </button>
                      </div>

                      <div className="grid grid-cols-[1fr_80px_80px] sm:grid-cols-[1fr_100px_100px] gap-2 items-center">
                        <div className="px-2 sm:px-3 py-2 font-semibold text-xs sm:text-sm text-white truncate">
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
                          className="bg-blue-500 hover:bg-blue-600 rounded py-1 sm:py-2 text-center transition"
                        >
                          <div className="font-bold text-sm sm:text-lg text-white">
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
                          className="bg-pink-500 hover:bg-pink-600 rounded py-1 sm:py-2 text-center transition"
                        >
                          <div className="font-bold text-sm sm:text-lg text-white">
                            {match.odds?.lay?.teamB || "2.2"}
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
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

export default Matches;