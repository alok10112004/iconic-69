import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import PageBackground from "../components/PageBackground";
import { playSound } from "../utils/sounds";

function Casino() {
  const { user, updateBalance } = useAuth();
  const [betAmount, setBetAmount] = useState(100);
  const [target, setTarget] = useState(50);
  const [direction, setDirection] = useState("under");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState([]);
  const [animatedRoll, setAnimatedRoll] = useState(null);
  const [rolling, setRolling] = useState(false);

  const winChance = direction === "under" ? target : 100 - target;
  const multiplier = (99 / winChance).toFixed(2);
  const profitOnWin = (betAmount * multiplier - betAmount).toFixed(2);

  useEffect(() => {
    if (result && result.roll !== undefined) {
      setRolling(true);
      playSound("dice");

      const targetNum = result.roll;
      const duration = 1500;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);

        let current;
        if (progress < 0.7) {
          current = Math.floor(Math.random() * 100);
        } else {
          current = Math.floor(
            targetNum * (1 - Math.pow(1 - (progress - 0.7) / 0.3, 3))
          );
        }

        setAnimatedRoll(current);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setAnimatedRoll(targetNum);
          setRolling(false);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [result]);

  const handlePlay = async () => {
    playSound("click");
    setLoading(true);
    setMessage("");
    setResult(null);
    setAnimatedRoll(null);

    try {
      const res = await axios.post(
        "/api/casino/dice",
        { betAmount: Number(betAmount), target: Number(target), direction },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      if (res.data.success) {
        setResult(res.data);
        updateBalance(res.data.newBalance);

        setTimeout(() => {
          if (res.data.won) {
            playSound("win");
          } else {
            playSound("lose");
          }
        }, 1500);

        setMessage(
          res.data.won
            ? `🎉 You won ${res.data.payout} coins!`
            : `😢 You lost`
        );
        setHistory((prev) => [
          { roll: res.data.roll, won: res.data.won },
          ...prev.slice(0, 9),
        ]);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const getRollColor = (roll) => {
    if (roll === null) return "text-gray-500";
    if (roll < target) return "text-green-400";
    return "text-red-400";
  };

  return (
    <PageBackground>
      <div className="max-w-2xl mx-auto text-white animate-fadeIn">
        <h1 className="text-3xl font-bold mb-6 text-red-500 text-center">
          🎲 Dice Game
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

        <div className="bg-gray-900/80 backdrop-blur rounded-lg p-6 border border-red-500/30 mb-4">
          <div className="text-center">
            <p className="text-gray-400 text-xs mb-2">
              {direction === "under" ? "Roll Under" : "Roll Over"} {target}
            </p>
            <div
              className={`text-6xl font-bold transition-all duration-200 ${
                rolling ? "animate-dice-roll" : ""
              } ${getRollColor(animatedRoll)} ${
                rolling ? "scale-110" : "scale-100"
              }`}
            >
              {animatedRoll !== null ? animatedRoll : "--"}
            </div>
            {result && !rolling && (
              <p
                className={`text-sm mt-2 font-bold animate-bounce-in ${
                  result.won ? "text-green-400" : "text-red-400"
                }`}
              >
                {result.won ? "🎉 YOU WON!" : "😢 YOU LOST"}
              </p>
            )}
          </div>

          <div className="relative mt-6 mb-2">
            <input
              type="range"
              min="1"
              max="99"
              value={target}
              onChange={(e) => setTarget(Number(e.target.value))}
              disabled={loading || rolling}
              className="w-full accent-red-500"
            />
            {animatedRoll !== null && (
              <div
                className="absolute top-0 pointer-events-none transition-all duration-300"
                style={{ left: `${animatedRoll}%` }}
              >
                <div className="w-1 h-6 bg-white shadow-lg shadow-white/50"></div>
              </div>
            )}
          </div>

          <div className="flex justify-between text-xs text-gray-500">
            <span>0</span>
            <span>25</span>
            <span>50</span>
            <span>75</span>
            <span>100</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-900/80 backdrop-blur rounded-lg p-3 border border-red-500/20">
            <p className="text-gray-400 text-xs">Win Chance</p>
            <p className="text-xl font-bold text-green-400">{winChance}%</p>
          </div>
          <div className="bg-gray-900/80 backdrop-blur rounded-lg p-3 border border-red-500/20">
            <p className="text-gray-400 text-xs">Multiplier</p>
            <p className="text-xl font-bold text-yellow-400">{multiplier}x</p>
          </div>
          <div className="bg-gray-900/80 backdrop-blur rounded-lg p-3 border border-red-500/20">
            <p className="text-gray-400 text-xs">Profit on Win</p>
            <p className="text-xl font-bold text-green-400">+{profitOnWin}</p>
          </div>
          <div className="bg-gray-900/80 backdrop-blur rounded-lg p-3 border border-red-500/20">
            <p className="text-gray-400 text-xs">Bet Amount</p>
            <p className="text-xl font-bold text-white">{betAmount}</p>
          </div>
        </div>

        <div className="bg-gray-900/80 backdrop-blur rounded-lg p-4 border border-red-500/30 space-y-4 mb-4">
          <div className="flex gap-2">
            <button
              onClick={() => {
                playSound("click");
                setDirection("under");
              }}
              disabled={loading || rolling}
              className={`flex-1 py-3 rounded font-bold text-lg transition-smooth ${
                direction === "under"
                  ? "bg-green-600 text-white shadow-lg shadow-green-600/50"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              ⬇️ Roll Under
            </button>
            <button
              onClick={() => {
                playSound("click");
                setDirection("over");
              }}
              disabled={loading || rolling}
              className={`flex-1 py-3 rounded font-bold text-lg transition-smooth ${
                direction === "over"
                  ? "bg-red-600 text-white shadow-lg shadow-red-600/50"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              ⬆️ Roll Over
            </button>
          </div>

          <div>
            <label className="block text-sm mb-1 text-gray-300">
              Bet Amount
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                disabled={loading || rolling}
                className="flex-1 bg-black border border-red-500/30 rounded px-3 py-2 text-white disabled:opacity-50"
              />
              <button
                onClick={() => {
                  playSound("click");
                  setBetAmount(Math.floor(betAmount / 2));
                }}
                disabled={loading || rolling}
                className="bg-gray-800 hover:bg-gray-700 px-3 rounded text-xs"
              >
                ½
              </button>
              <button
                onClick={() => {
                  playSound("click");
                  setBetAmount(betAmount * 2);
                }}
                disabled={loading || rolling}
                className="bg-gray-800 hover:bg-gray-700 px-3 rounded text-xs"
              >
                2x
              </button>
              <button
                onClick={() => {
                  playSound("click");
                  setBetAmount(user?.balance || 0);
                }}
                disabled={loading || rolling}
                className="bg-gray-800 hover:bg-gray-700 px-3 rounded text-xs"
              >
                Max
              </button>
            </div>
          </div>

          <button
            onClick={handlePlay}
            disabled={loading || rolling}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-700 py-4 rounded font-bold text-xl transition-smooth transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-red-600/50"
          >
            {rolling
              ? "🎲 Rolling..."
              : loading
              ? "Starting..."
              : "🎲 Roll Dice"}
          </button>
        </div>

        {history.length > 0 && (
          <div className="bg-gray-900/80 backdrop-blur rounded-lg p-4 border border-red-500/30">
            <p className="text-gray-400 text-xs mb-2">Last Rolls</p>
            <div className="flex gap-2 flex-wrap">
              {history.map((h, i) => (
                <div
                  key={i}
                  className={`px-3 py-1 rounded text-sm font-bold animate-bounce-in ${
                    h.won
                      ? "bg-green-600/30 text-green-400"
                      : "bg-red-600/30 text-red-400"
                  }`}
                >
                  {h.roll}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PageBackground>
  );
}

export default Casino;