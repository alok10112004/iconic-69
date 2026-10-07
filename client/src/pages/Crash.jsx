import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import PageBackground from "../components/PageBackground";
import { playSound } from "../utils/sounds";

function Crash() {
  const { user, updateBalance } = useAuth();
  const [betAmount, setBetAmount] = useState(100);
  const [status, setStatus] = useState("waiting");
  const [multiplier, setMultiplier] = useState(1.0);
  const [roundId, setRoundId] = useState(null);
  const [serverSeedHash, setServerSeedHash] = useState(null);
  const [crashPoint, setCrashPoint] = useState(null);
  const [players, setPlayers] = useState([]);
  const [history, setHistory] = useState([]);
  const [myBet, setMyBet] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef(null);
  const crashSoundPlayed = useRef(false);

  useEffect(() => {
    const pollStatus = async () => {
      try {
        const res = await axios.get("/api/casino/crash/status", {
          headers: { Authorization: `Bearer ${user.token}` },
        });

        if (res.data.success) {
          setStatus(res.data.status);
          setRoundId(res.data.roundId);
          setServerSeedHash(res.data.serverSeedHash);

          if (res.data.status === "running") {
            setMultiplier(res.data.multiplier);
            setPlayers(res.data.players || []);
            setCrashPoint(null);
            crashSoundPlayed.current = false;
          } else if (res.data.status === "crashed") {
            if (!crashSoundPlayed.current) {
              playSound("crash");
              crashSoundPlayed.current = true;
            }
            setCrashPoint(res.data.crashPoint);
            setMyBet(null);
            setMessage(`💥 Crashed at ${res.data.crashPoint.toFixed(2)}x!`);
            if (res.data.history) setHistory(res.data.history);
          }
        }
      } catch (err) {
        console.error(err);
      }
    };

    pollStatus();
    intervalRef.current = setInterval(pollStatus, 100);

    return () => clearInterval(intervalRef.current);
  }, [user]);

  const handleStart = async () => {
    playSound("click");
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post(
        "/api/casino/crash/start",
        { betAmount: Number(betAmount) },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      if (res.data.success) {
        setMyBet(betAmount);
        updateBalance(res.data.newBalance);
        setMessage("🎯 Game started! Cash out before crash!");
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCashout = async () => {
    playSound("cashout");
    try {
      const res = await axios.post(
        "/api/casino/crash/cashout",
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      if (res.data.success) {
        playSound("win");
        updateBalance(res.data.newBalance);
        setMessage(res.data.message);
        setMyBet(null);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Cashout failed");
    }
  };

  const altitude = Math.min((multiplier - 1) * 15, 80);

  return (
    <PageBackground>
      <div className="max-w-4xl mx-auto text-white animate-fadeIn">
        <h1 className="text-3xl font-bold mb-6 text-red-500 text-center">
          ✈️ Crash
        </h1>

        <div className="bg-gray-900/80 backdrop-blur rounded-lg p-4 border border-red-500/30 mb-4">
          <p className="text-gray-400 text-xs">Balance</p>
          <p className="text-2xl font-bold text-red-500">
            {user?.balance?.toFixed(2)} coins
          </p>
        </div>

        {message && (
          <div
            className={`p-3 rounded mb-4 text-sm text-center border animate-bounce-in ${
              message.includes("Won") || message.includes("Cashed")
                ? "bg-green-500/20 border-green-500 text-green-300"
                : "bg-red-500/20 border-red-500 text-red-300"
            }`}
          >
            {message}
          </div>
        )}

        <div className="bg-gray-900/80 backdrop-blur rounded-lg p-6 border border-red-500/30 mb-4 relative overflow-hidden">
          <div className="text-center mb-4">
            <p
              className={`text-6xl font-bold transition-all ${
                status === "crashed"
                  ? "text-red-500 animate-shake"
                  : status === "running"
                  ? "text-green-400"
                  : "text-gray-500"
              }`}
            >
              {status === "crashed"
                ? `${crashPoint?.toFixed(2)}x`
                : status === "running"
                ? `${multiplier.toFixed(2)}x`
                : "Waiting..."}
            </p>
            {status === "crashed" && (
              <p className="text-red-400 text-lg mt-2 font-bold animate-bounce-in">
                💥 CRASHED!
              </p>
            )}
          </div>

          <div className="h-48 relative bg-black/40 rounded-lg overflow-hidden border border-red-500/20">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute left-0 right-0 top-1/4 border-t border-red-500"></div>
              <div className="absolute left-0 right-0 top-2/4 border-t border-red-500"></div>
              <div className="absolute left-0 right-0 top-3/4 border-t border-red-500"></div>
            </div>

            {status === "running" && (
              <div
                className="absolute text-4xl transition-all duration-200"
                style={{
                  bottom: `${altitude}%`,
                  left: `${Math.min((multiplier - 1) * 10, 80)}%`,
                  transform: "rotate(-15deg)",
                }}
              >
                ✈️
              </div>
            )}

            {status === "crashed" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-6xl animate-crash-explode">💥</p>
              </div>
            )}
          </div>
        </div>

        {status === "running" && players.length > 0 && (
          <div className="bg-gray-900/80 backdrop-blur rounded-lg p-4 border border-red-500/30 mb-4">
            <p className="text-gray-400 text-xs mb-2">
              Live Players ({players.length})
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-32 overflow-y-auto">
              {players.map((p, i) => (
                <div
                  key={i}
                  className={`text-xs p-2 rounded transition-smooth ${
                    p.cashedOut
                      ? "bg-green-600/30 text-green-400"
                      : "bg-gray-800 text-gray-300"
                  }`}
                >
                  <p className="font-bold truncate">{p.name}</p>
                  <p>💰 {p.betAmount}</p>
                  {p.cashedOut && <p>✅ {p.cashoutMultiplier}x</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-gray-900/80 backdrop-blur rounded-lg p-4 border border-red-500/30 mb-4">
          {!myBet ? (
            <>
              <label className="block text-sm mb-1 text-gray-300">
                Bet Amount
              </label>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                disabled={loading || status === "running"}
                className="w-full bg-black border border-red-500/30 rounded px-3 py-2 text-white mb-3 disabled:opacity-50"
              />
              <button
                onClick={handleStart}
                disabled={loading || status === "running"}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 py-4 rounded font-bold text-xl transition-smooth transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-green-600/50"
              >
                {loading ? "Starting..." : "✈️ Place Bet"}
              </button>
            </>
          ) : (
            <button
              onClick={handleCashout}
              className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 py-4 rounded font-bold text-xl animate-pulse-glow transition-smooth"
            >
              💰 Cash Out at {multiplier.toFixed(2)}x (
              {(myBet * multiplier).toFixed(2)} coins)
            </button>
          )}
        </div>

        {history.length > 0 && (
          <div className="bg-gray-900/80 backdrop-blur rounded-lg p-4 border border-red-500/30">
            <p className="text-gray-400 text-xs mb-2">Recent Crashes</p>
            <div className="flex gap-2 flex-wrap">
              {history
                .slice(-15)
                .reverse()
                .map((h, i) => (
                  <div
                    key={i}
                    className={`px-3 py-1 rounded text-xs font-bold animate-bounce-in ${
                      h.crashPoint >= 2
                        ? "bg-green-600/30 text-green-400"
                        : "bg-red-600/30 text-red-400"
                    }`}
                  >
                    {h.crashPoint.toFixed(2)}x
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </PageBackground>
  );
}

export default Crash;