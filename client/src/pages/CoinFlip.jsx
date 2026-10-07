import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import PageBackground from "../components/PageBackground";
import { playSound } from "../utils/sounds";

function CoinFlip() {
  const { user, updateBalance } = useAuth();
  const [betAmount, setBetAmount] = useState(100);
  const [pick, setPick] = useState("heads");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [flipping, setFlipping] = useState(false);

  const handlePlay = async () => {
    playSound("click");
    setLoading(true);
    setMessage("");
    setResult(null);
    setFlipping(true);

    try {
      const res = await axios.post(
        "/api/casino/coinflip",
        { betAmount: Number(betAmount), pick },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      if (res.data.success) {
        setTimeout(() => {
          setResult(res.data);
          updateBalance(res.data.newBalance);
          setFlipping(false);

          if (res.data.won) {
            playSound("win");
          } else {
            playSound("lose");
          }

          setMessage(
            res.data.won
              ? `🎉 You won ${res.data.payout} coins!`
              : `😢 You lost`
          );
        }, 1000);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed");
      setFlipping(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageBackground>
      <div className="max-w-md mx-auto text-white animate-fadeIn">
        <h1 className="text-3xl font-bold mb-6 text-red-500 text-center">
          🪙 Coin Flip
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
              result?.won
                ? "bg-green-500/20 border-green-500 text-green-300"
                : "bg-red-500/20 border-red-500 text-red-300"
            }`}
          >
            {message}
          </div>
        )}

        {/* Coin Display */}
        <div className="bg-gray-900/80 backdrop-blur rounded-lg p-8 border border-red-500/30 mb-4 text-center">
          <div
            className={`text-8xl mb-4 transition-all ${
              flipping ? "animate-coin-flip" : ""
            }`}
          >
            {result
              ? result.result === "heads"
                ? "👑"
                : "🦅"
              : "🪙"}
          </div>
          {result && !flipping && (
            <p className="text-2xl font-bold capitalize animate-bounce-in">
              {result.result}
            </p>
          )}
        </div>

        <div className="bg-gray-900/80 backdrop-blur rounded-lg p-4 border border-red-500/30 space-y-4">
          <div className="flex gap-2">
            <button
              onClick={() => {
                playSound("click");
                setPick("heads");
              }}
              disabled={loading || flipping}
              className={`flex-1 py-3 rounded font-bold text-lg transition-smooth ${
                pick === "heads"
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/50"
                  : "bg-gray-800 text-gray-400"
              }`}
            >
              👑 Heads
            </button>
            <button
              onClick={() => {
                playSound("click");
                setPick("tails");
              }}
              disabled={loading || flipping}
              className={`flex-1 py-3 rounded font-bold text-lg transition-smooth ${
                pick === "tails"
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/50"
                  : "bg-gray-800 text-gray-400"
              }`}
            >
              🦅 Tails
            </button>
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-300">
              Bet Amount
            </label>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(Number(e.target.value))}
              disabled={loading || flipping}
              className="w-full bg-black border border-red-500/30 rounded px-3 py-2 text-white"
            />
          </div>

          <button
            onClick={handlePlay}
            disabled={loading || flipping}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-700 py-4 rounded font-bold text-xl transition-smooth transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-red-600/50"
          >
            {flipping ? "🪙 Flipping..." : loading ? "Starting..." : "🪙 Flip Coin"}
          </button>
        </div>
      </div>
    </PageBackground>
  );
}

export default CoinFlip;