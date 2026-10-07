import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import PageBackground from "../components/PageBackground";
import { playSound } from "../utils/sounds";

function Roulette() {
  const { user, updateBalance } = useAuth();
  const [chipValue, setChipValue] = useState(100);
  const [bets, setBets] = useState([]);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [spinning, setSpinning] = useState(false);
  const [history, setHistory] = useState([]);

  const RED_NUMBERS = [
    1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
  ];

  const WHEEL_ORDER = [
    0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10,
    5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
  ];

  const NUMBER_ROWS = [
    [3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36],
    [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35],
    [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34],
  ];

  const CHIPS = [10, 25, 50, 100, 500, 1000];

  const addBet = (type, value) => {
    playSound("click");
    setBets((prev) => {
      const existing = prev.find((b) => b.type === type && b.value === value);
      if (existing) {
        return prev.map((b) =>
          b.type === type && b.value === value
            ? { ...b, amount: b.amount + chipValue }
            : b
        );
      }
      return [...prev, { type, value, amount: chipValue }];
    });
  };

  const removeBet = (index) => {
    playSound("click");
    setBets((prev) => prev.filter((_, i) => i !== index));
  };

  const undoBet = () => {
    playSound("click");
    setBets((prev) => prev.slice(0, -1));
  };

  const clearBets = () => {
    playSound("click");
    setBets([]);
  };

  const doubleBets = () => {
    playSound("click");
    setBets((prev) => prev.map((b) => ({ ...b, amount: b.amount * 2 })));
  };

  const totalBet = bets.reduce((sum, b) => sum + b.amount, 0);

  const handleSpin = async () => {
    if (bets.length === 0) {
      setMessage("❌ Place at least one bet");
      return;
    }
    if (totalBet > user.balance) {
      setMessage("❌ Insufficient balance");
      return;
    }

    playSound("click");
    setLoading(true);
    setMessage("");
    setResult(null);
    setSpinning(true);

    try {
      const res = await axios.post(
        "/api/casino/roulette",
        { betAmount: totalBet, bets },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      if (res.data.success) {
        playSound("roulette");
        setTimeout(() => {
          setResult(res.data);
          updateBalance(res.data.newBalance);
          setSpinning(false);
          if (res.data.won) playSound("win");
          else playSound("lose");
          setMessage(
            res.data.won
              ? `🎉 You won ${res.data.payout} coins!`
              : `😢 You lost ${totalBet} coins`
          );
          setHistory((prev) => [
            { number: res.data.result, color: res.data.color },
            ...prev.slice(0, 14),
          ]);
          setBets([]);
        }, 8000);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed");
      setSpinning(false);
      setLoading(false);
    }
  };

  const getNumberColor = (num) => {
    if (num === 0) return "bg-green-600";
    return RED_NUMBERS.includes(num) ? "bg-red-600" : "bg-black";
  };

  const isBetOnNumber = (num) =>
    bets.find((b) => b.type === "number" && b.value === num);
  const isBetOnOutside = (type) => bets.find((b) => b.type === type);

  const getWheelRotation = () => {
    if (spinning) return 1800;
    if (result) {
      const idx = WHEEL_ORDER.indexOf(result.result);
      return -(idx * 360) / 37;
    }
    return 0;
  };

  const getBallRotation = () => {
    if (spinning) return -1440;
    if (result) {
      const idx = WHEEL_ORDER.indexOf(result.result);
      return (idx * 360) / 37;
    }
    return 0;
  };

  return (
    <PageBackground>
      <div className="max-w-7xl mx-auto text-white animate-fadeIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-800 to-green-900 rounded-t-2xl p-3 md:p-4 border-b-4 border-yellow-600">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-yellow-400 drop-shadow-lg">
              🎡 EUROPEAN ROULETTE
            </h1>
            <div className="text-right">
              <p className="text-xs text-green-200">Balance</p>
              <p className="text-xl font-bold text-yellow-400">
                💰 {user?.balance?.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {message && (
          <div
            className={`p-3 text-sm text-center border animate-bounce-in ${
              result?.won
                ? "bg-green-500/20 border-green-500 text-green-300"
                : "bg-red-500/20 border-red-500 text-red-300"
            }`}
          >
            {message}
          </div>
        )}

        <div className="bg-green-900 p-2 md:p-4 rounded-b-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
            {/* LEFT: History + Wheel + Chips */}
            <div className="lg:col-span-1 space-y-3">
              {/* Last Numbers */}
              <div className="bg-green-950/80 rounded-lg p-3 border-2 border-yellow-600">
                <p className="text-xs mb-2 text-yellow-400 font-bold">
                  🎯 LAST NUMBERS
                </p>
                <div className="flex gap-1 flex-wrap">
                  {history.length === 0 ? (
                    <p className="text-xs text-gray-500">No spins yet</p>
                  ) : (
                    history.map((h, i) => (
                      <div
                        key={i}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getNumberColor(
                          h.number
                        )} border-2 border-yellow-600`}
                      >
                        {h.number}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* REAL IMAGE WHEEL */}
              <div className="bg-green-950/80 rounded-lg p-3 border-2 border-yellow-600">
                <div className="relative w-full aspect-square">
                  {/* Wheel Image — rotating */}
                  <img
                    src="/roulette-wheel.png"
                    alt="Roulette Wheel"
                    className="absolute inset-0 w-full h-full object-contain"
                    style={{
                      animation: spinning
                        ? "rlt-wheel-spin 8s cubic-bezier(0.17, 0.67, 0.12, 0.99) forwards"
                        : "none",
                      transform: spinning
                        ? undefined
                        : `rotate(${getWheelRotation()}deg)`,
                      transition: spinning
                        ? "none"
                        : "transform 0.5s ease-out",
                    }}
                  />

                  {/* Ball — image ke bahar track pe ghumegi */}
                  <div
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      background:
                        "radial-gradient(circle at 30% 30%, #ffffff, #e0e0e0, #a0a0a0)",
                      boxShadow:
                        "0 0 15px rgba(255,255,255,0.9), 0 3px 6px rgba(0,0,0,0.6), inset -1px -1px 3px rgba(0,0,0,0.4)",
                      pointerEvents: "none",
                      zIndex: 30,
                      animation: spinning
                        ? "rlt-ball-spin 8s cubic-bezier(0.17, 0.67, 0.12, 0.99) forwards"
                        : "none",
                      transform: spinning
                        ? undefined
                        : `translate(-50%, -50%) rotate(${getBallRotation()}deg) translateY(-42%)`,
                      transition: spinning
                        ? "none"
                        : "transform 0.5s ease-out",
                    }}
                  ></div>
                </div>

                {/* Result */}
                {result && !spinning && (
                  <div className="mt-3 text-center animate-bounce-in">
                    <div
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${getNumberColor(
                        result.result
                      )} border-2 border-yellow-600 roulette-result-glow`}
                    >
                      <span className="text-xs">Result:</span>
                      <span className="text-2xl font-bold">
                        {result.result}
                      </span>
                      <span className="text-xs capitalize">
                        {result.color}
                      </span>
                    </div>
                  </div>
                )}

                {spinning && (
                  <p className="text-center text-yellow-400 text-sm font-bold mt-3 animate-pulse">
                    🎡 Spinning...
                  </p>
                )}
              </div>

              {/* Chips */}
              <div className="bg-green-950/80 rounded-lg p-3 border-2 border-yellow-600">
                <p className="text-xs mb-2 text-yellow-400 font-bold">
                  💰 SELECT CHIP
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {CHIPS.map((chip) => (
                    <button
                      key={chip}
                      onClick={() => {
                        playSound("click");
                        setChipValue(chip);
                      }}
                      className={`py-2 rounded-full text-xs font-bold transition-smooth ${
                        chipValue === chip
                          ? "bg-yellow-500 text-black scale-110 shadow-lg shadow-yellow-500/50"
                          : "bg-gray-700 text-white hover:bg-gray-600"
                      }`}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* CENTER + RIGHT: Table */}
            <div className="lg:col-span-3">
              <div className="bg-green-800 rounded-lg p-3 border-4 border-yellow-600 overflow-x-auto">
                <div className="min-w-[700px]">
                  <div className="flex gap-1 mb-1">
                    <button
                      onClick={() => addBet("number", 0)}
                      className={`w-16 h-16 md:w-20 md:h-20 rounded bg-green-600 text-white font-bold text-xl hover:scale-105 transition-smooth border-2 border-yellow-600 relative ${
                        isBetOnNumber(0) ? "ring-4 ring-yellow-400" : ""
                      }`}
                    >
                      0
                      {isBetOnNumber(0) && (
                        <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                          {isBetOnNumber(0).amount}
                        </span>
                      )}
                    </button>

                    <div className="flex-1">
                      {NUMBER_ROWS.map((row, rIdx) => (
                        <div key={rIdx} className="flex gap-1 mb-1">
                          {row.map((num) => (
                            <button
                              key={num}
                              onClick={() => addBet("number", num)}
                              className={`flex-1 h-16 md:h-20 rounded ${getNumberColor(
                                num
                              )} text-white font-bold text-lg hover:scale-105 transition-smooth border-2 border-yellow-600 relative`}
                            >
                              {num}
                              {isBetOnNumber(num) && (
                                <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                                  {isBetOnNumber(num).amount}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-col gap-1">
                      {[3, 2, 1].map((col) => (
                        <button
                          key={col}
                          onClick={() => addBet("column", col)}
                          className="w-16 h-16 md:h-20 rounded bg-green-700 text-white font-bold text-xs hover:scale-105 transition-smooth border-2 border-yellow-600 relative"
                        >
                          2:1
                          {isBetOnOutside(`column-${col}`) && (
                            <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                              {isBetOnOutside(`column-${col}`).amount}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-1 mt-2 mb-1 ml-16">
                    {[1, 2, 3].map((d) => (
                      <button
                        key={d}
                        onClick={() => addBet("dozen", d)}
                        className="flex-1 h-14 rounded bg-green-700 text-white font-bold text-sm hover:scale-105 transition-smooth border-2 border-yellow-600 relative"
                      >
                        {d === 1 ? "1st 12" : d === 2 ? "2nd 12" : "3rd 12"}
                        {isBetOnOutside(`dozen-${d}`) && (
                          <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                            {isBetOnOutside(`dozen-${d}`).amount}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-1 ml-16">
                    {[
                      { id: "low", label: "1~18", color: "bg-green-700" },
                      { id: "even", label: "EVEN", color: "bg-green-700" },
                      { id: "red", label: "🔴 RED", color: "bg-red-600" },
                      { id: "black", label: "⚫ BLACK", color: "bg-black" },
                      { id: "odd", label: "ODD", color: "bg-green-700" },
                      { id: "high", label: "19~36", color: "bg-green-700" },
                    ].map((b) => (
                      <button
                        key={b.id}
                        onClick={() => addBet(b.id, b.id)}
                        className={`flex-1 h-14 rounded ${b.color} text-white font-bold text-sm hover:scale-105 transition-smooth border-2 border-yellow-600 relative`}
                      >
                        {b.label}
                        {isBetOnOutside(b.id) && (
                          <span className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
                            {isBetOnOutside(b.id).amount}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-green-950/80 rounded-lg p-3 mt-3 border-2 border-yellow-600">
                <div className="flex justify-between items-center mb-2 flex-wrap gap-2">
                  <p className="text-xs text-yellow-400 font-bold">
                    🎯 YOUR BETS ({bets.length})
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={undoBet}
                      disabled={bets.length === 0}
                      className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 px-3 py-1 rounded text-xs font-bold"
                    >
                      ↩ UNDO
                    </button>
                    <button
                      onClick={doubleBets}
                      disabled={bets.length === 0}
                      className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 px-3 py-1 rounded text-xs font-bold"
                    >
                      ×2 DOUBLE
                    </button>
                    <button
                      onClick={clearBets}
                      disabled={bets.length === 0}
                      className="bg-red-600 hover:bg-red-700 disabled:bg-gray-700 px-3 py-1 rounded text-xs font-bold"
                    >
                      ✕ CLEAR
                    </button>
                  </div>
                </div>
                {bets.length === 0 ? (
                  <p className="text-xs text-gray-500">
                    Click on the table to place bets
                  </p>
                ) : (
                  <div className="flex gap-2 flex-wrap">
                    {bets.map((bet, i) => (
                      <div
                        key={i}
                        className="bg-yellow-600 text-black px-2 py-1 rounded text-xs font-bold flex items-center gap-2"
                      >
                        <span>
                          {bet.type === "number"
                            ? `#${bet.value}`
                            : `${bet.type}-${bet.value}`}
                        </span>
                        <span>💰 {bet.amount}</span>
                        <button
                          onClick={() => removeBet(i)}
                          className="text-red-800 hover:text-red-600"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-2">
                  <p className="text-sm font-bold text-yellow-400">
                    Total Bet: 💰 {totalBet}
                  </p>
                </div>
              </div>

              <button
                onClick={handleSpin}
                disabled={loading || spinning || bets.length === 0}
                className="w-full mt-3 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 disabled:from-gray-600 disabled:to-gray-700 py-4 rounded-xl font-bold text-2xl transition-smooth transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-yellow-500/50 text-black"
              >
                {spinning
                  ? "🎡 SPINNING..."
                  : loading
                  ? "Starting..."
                  : "🎡 SPIN THE WHEEL"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </PageBackground>
  );
}

export default Roulette;