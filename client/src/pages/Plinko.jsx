import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import PageBackground from "../components/PageBackground";
import { playSound } from "../utils/sounds";

function Plinko() {
  const { user, updateBalance } = useAuth();
  const [betAmount, setBetAmount] = useState(100);
  const [rows, setRows] = useState(12);
  const [risk, setRisk] = useState("medium");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [ballPosition, setBallPosition] = useState(null);
  const [animating, setAnimating] = useState(false);
  const animationRef = useRef(null);

  const multipliers = {
    low: {
      8: [5.6, 2.1, 1.1, 1.0, 0.5, 1.0, 1.1, 2.1, 5.6],
      12: [8.1, 3.0, 1.6, 1.2, 0.9, 0.7, 0.7, 0.9, 1.2, 1.6, 3.0, 8.1],
      16: [16, 9, 2, 1.4, 1.4, 1.2, 1.1, 1.0, 0.5, 1.0, 1.1, 1.2, 1.4, 1.4, 2, 9, 16],
    },
    medium: {
      8: [13, 3, 1.3, 0.7, 0.4, 0.7, 1.3, 3, 13],
      12: [24, 5.6, 2.1, 1.1, 0.6, 0.4, 0.4, 0.6, 1.1, 2.1, 5.6, 24],
      16: [110, 41, 10, 3, 1.6, 1.1, 1, 0.7, 0.4, 0.7, 1, 1.1, 1.6, 3, 10, 41, 110],
    },
    high: {
      8: [29, 4, 1.5, 0.3, 0.2, 0.3, 1.5, 4, 29],
      12: [170, 24, 8.1, 2, 0.7, 0.2, 0.2, 0.7, 2, 8.1, 24, 170],
      16: [1000, 130, 26, 9, 4, 2, 0.2, 0.2, 0.2, 0.2, 0.2, 2, 4, 9, 26, 130, 1000],
    },
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) clearTimeout(animationRef.current);
    };
  }, []);

  const handleDrop = async () => {
    if (animating) return;

    playSound("click");
    setLoading(true);
    setMessage("");
    setResult(null);
    setBallPosition({ row: 0, col: 0 });
    setAnimating(true);

    try {
      const res = await axios.post(
        "/api/casino/plinko",
        { betAmount: Number(betAmount), rows: Number(rows), risk },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      if (res.data.success) {
        animateBall(res.data.path, res.data);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed");
      setAnimating(false);
      setLoading(false);
    }
  };

  const animateBall = (path, data) => {
    let currentRow = 0;
    let currentCol = 0;

    const step = () => {
      if (currentRow >= path.length) {
        setAnimating(false);
        setLoading(false);
        setResult(data);
        updateBalance(data.newBalance);

        if (data.multiplier >= 1) {
          playSound("win");
        } else {
          playSound("lose");
        }

        setMessage(
          data.multiplier >= 1
            ? `🎉 Landed on ${data.multiplier}x — Won ${data.payout} coins!`
            : `😢 Landed on ${data.multiplier}x — Lost`
        );
        return;
      }

      const direction = path[currentRow];
      if (direction === "R") currentCol++;

      setBallPosition({ row: currentRow + 1, col: currentCol });
      playSound("coin");
      currentRow++;

      animationRef.current = setTimeout(step, 300);
    };

    animationRef.current = setTimeout(step, 400);
  };

  const currentTable = multipliers[risk][Number(rows)] || multipliers.medium[12];

  const getSlotColor = (multiplier) => {
    if (multiplier >= 10) return "bg-red-600 text-white";
    if (multiplier >= 2) return "bg-orange-600 text-white";
    if (multiplier >= 1) return "bg-yellow-600 text-white";
    if (multiplier >= 0.5) return "bg-blue-600 text-white";
    return "bg-gray-700 text-gray-300";
  };

  return (
    <PageBackground>
      <div className="max-w-4xl mx-auto text-white animate-fadeIn">
        <h1 className="text-3xl font-bold mb-6 text-red-500 text-center">
          🎯 Plinko
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
              result?.multiplier >= 1
                ? "bg-green-500/20 border-green-500 text-green-300"
                : "bg-red-500/20 border-red-500 text-red-300"
            }`}
          >
            {message}
          </div>
        )}

        {/* Game Board */}
        <div className="bg-gray-900/80 backdrop-blur rounded-lg p-3 sm:p-6 border border-red-500/30 mb-4 overflow-x-auto">
          <div className="flex flex-col items-center justify-center min-w-[500px] sm:min-w-0 py-8">
            {Array.from({ length: Number(rows) }).map((_, rowIdx) => (
              <div
                key={rowIdx}
                className="flex justify-center gap-3 sm:gap-4 md:gap-6 my-2 relative"
              >
                {Array.from({ length: rowIdx + 1 }).map((_, colIdx) => (
                  <div
                    key={colIdx}
                    className="relative flex items-center justify-center"
                  >
                    {ballPosition &&
                      ballPosition.row === rowIdx &&
                      ballPosition.col === colIdx && (
                        <div
                          className="absolute text-3xl sm:text-4xl z-20 animate-bounce"
                          style={{
                            top: "-28px",
                            left: "50%",
                            transform: "translateX(-50%)",
                          }}
                        >
                          🔴
                        </div>
                      )}
                    <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-red-500 shadow-lg shadow-red-500/50"></div>
                  </div>
                ))}
              </div>
            ))}

            <div className="flex justify-center gap-1 sm:gap-2 mt-8 w-full px-2">
              {currentTable.map((mult, i) => (
                <div
                  key={i}
                  className={`flex-1 min-w-[42px] sm:min-w-[55px] text-center py-2 sm:py-3 rounded text-xs sm:text-sm font-bold transition-all duration-300 ${getSlotColor(
                    mult
                  )} ${
                    result && result.position === i
                      ? "ring-4 ring-white animate-pulse scale-110"
                      : ""
                  }`}
                >
                  {mult}x
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-gray-900/80 backdrop-blur rounded-lg p-4 border border-red-500/30 space-y-4">
          <div>
            <label className="block text-sm mb-1 text-gray-300">
              Bet Amount
            </label>
            <input
              type="number"
              value={betAmount}
              onChange={(e) => setBetAmount(e.target.value)}
              disabled={animating}
              className="w-full bg-black border border-red-500/30 rounded px-3 py-2 text-white disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm mb-2 text-gray-300">Rows</label>
            <div className="flex gap-2">
              {[8, 12, 16].map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    playSound("click");
                    setRows(r);
                  }}
                  disabled={animating}
                  className={`flex-1 py-2 rounded font-semibold transition-smooth disabled:opacity-50 ${
                    Number(rows) === r
                      ? "bg-red-600 text-white shadow-lg shadow-red-600/50"
                      : "bg-gray-800 text-gray-400"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm mb-2 text-gray-300">Risk</label>
            <div className="flex gap-2">
              {["low", "medium", "high"].map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    playSound("click");
                    setRisk(r);
                  }}
                  disabled={animating}
                  className={`flex-1 py-2 rounded font-semibold capitalize transition-smooth disabled:opacity-50 ${
                    risk === r
                      ? "bg-red-600 text-white shadow-lg shadow-red-600/50"
                      : "bg-gray-800 text-gray-400"
                  }`}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleDrop}
            disabled={loading || animating}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-gray-600 disabled:to-gray-700 py-3 rounded font-bold text-lg transition-smooth transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-red-600/50"
          >
            {animating
              ? "🎯 Ball dropping..."
              : loading
              ? "Starting..."
              : "🎯 Drop Ball"}
          </button>
        </div>
      </div>
    </PageBackground>
  );
}

export default Plinko;