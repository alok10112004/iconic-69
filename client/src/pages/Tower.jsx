import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import PageBackground from "../components/PageBackground";
import { playSound } from "../utils/sounds";

function Tower() {
  const { user, updateBalance } = useAuth();
  const [betAmount, setBetAmount] = useState(100);
  const [difficulty, setDifficulty] = useState("easy");
  const [gameId, setGameId] = useState(null);
  const [tilesPerRow, setTilesPerRow] = useState(4);
  const [totalRows, setTotalRows] = useState(8);
  const [currentRow, setCurrentRow] = useState(0);
  const [revealedRows, setRevealedRows] = useState([]);
  const [safeTiles, setSafeTiles] = useState([]);
  const [multiplier, setMultiplier] = useState(1);
  const [potentialWin, setPotentialWin] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const DIFFICULTIES = [
    { id: "easy", name: "Easy", tiles: 4, blocks: 1, rows: 8, icon: "🟢" },
    { id: "medium", name: "Medium", tiles: 4, blocks: 2, rows: 8, icon: "🟡" },
    { id: "hard", name: "Hard", tiles: 4, blocks: 3, rows: 8, icon: "🟠" },
    { id: "extreme", name: "Extreme", tiles: 4, blocks: 3, rows: 12, icon: "🔴" },
    { id: "nightmare", name: "Nightmare", tiles: 5, blocks: 4, rows: 15, icon: "💀" },
  ];

  const startGame = async () => {
    playSound("click");
    setLoading(true);
    setMessage("");
    setRevealedRows([]);
    setSafeTiles([]);
    setMultiplier(1);
    setPotentialWin(0);
    setGameOver(false);
    setCurrentRow(0);

    try {
      const res = await axios.post(
        "/api/casino/tower/start",
        { betAmount: Number(betAmount), difficulty },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      if (res.data.success) {
        setGameId(res.data.gameId);
        setTilesPerRow(res.data.tilesPerRow);
        setTotalRows(res.data.totalRows);
        updateBalance(res.data.newBalance);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to start");
    } finally {
      setLoading(false);
    }
  };

  const revealTile = async (tileIndex) => {
    if (!gameId || gameOver) return;
    playSound("click");

    try {
      const res = await axios.post(
        "/api/casino/tower/reveal",
        { gameId, tileIndex },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      if (res.data.hitBlock) {
        playSound("lose");
        setSafeTiles(res.data.safeTiles);
        setGameOver(true);
        setMessage("💥 You hit a block! Game over.");
        setGameId(null);
      } else {
        playSound("coin");
        setRevealedRows(res.data.revealedRows);
        setCurrentRow(res.data.currentRow);
        setMultiplier(res.data.multiplier);

        if (res.data.allRevealed) {
          playSound("win");
          setGameOver(true);
          setSafeTiles(res.data.revealedRows.map((r) => r.tileIndex));
          updateBalance(res.data.newBalance);
          setMessage(res.data.message);
          setGameId(null);
        } else {
          setPotentialWin(res.data.potentialWin);
        }
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed");
    }
  };

  const cashout = async () => {
    if (!gameId) return;
    playSound("cashout");

    try {
      const res = await axios.post(
        "/api/casino/tower/cashout",
        { gameId },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      if (res.data.success) {
        playSound("win");
        updateBalance(res.data.newBalance);
        setMessage(res.data.message);
        setGameOver(true);
        setGameId(null);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed");
    }
  };

  const getMultiplierForRow = (row) => {
    let mult = 1;
    const safeCount = tilesPerRow - (DIFFICULTIES.find((d) => d.id === difficulty)?.blocks || 1);
    for (let i = 0; i < row; i++) {
      mult *= tilesPerRow / safeCount;
    }
    return (mult * 0.97).toFixed(2);
  };

  const ladder = Array.from({ length: totalRows }, (_, i) =>
    getMultiplierForRow(i + 1)
  );

  return (
    <PageBackground>
      <div className="max-w-6xl mx-auto text-white animate-fadeIn">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-4 md:p-6 mb-4 shadow-2xl shadow-blue-600/30">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white text-center">
            🗼 TOWER
          </h1>
          <p className="text-blue-100 text-sm md:text-base text-center mt-2">
            Balance:{" "}
            <span className="font-bold text-white text-lg">
              💰 {user?.balance?.toFixed(2)} coins
            </span>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 space-y-3">
            <div className="bg-gray-900/80 backdrop-blur rounded-lg p-4 border border-red-500/30">
              <label className="block text-xs mb-2 text-gray-300 font-semibold">
                💰 BET AMOUNT
              </label>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(Number(e.target.value))}
                disabled={!!gameId}
                className="w-full bg-black border border-red-500/30 rounded px-3 py-2 text-white text-lg font-bold disabled:opacity-50 mb-2"
              />
              <div className="grid grid-cols-4 gap-1">
                <button
                  onClick={() => {
                    playSound("click");
                    setBetAmount(10);
                  }}
                  disabled={!!gameId}
                  className="bg-gray-800 hover:bg-gray-700 py-1 rounded text-xs font-bold"
                >
                  MIN
                </button>
                <button
                  onClick={() => {
                    playSound("click");
                    setBetAmount(Math.max(1, Math.floor(betAmount / 2)));
                  }}
                  disabled={!!gameId}
                  className="bg-gray-800 hover:bg-gray-700 py-1 rounded text-xs font-bold"
                >
                  ÷
                </button>
                <button
                  onClick={() => {
                    playSound("click");
                    setBetAmount(betAmount * 2);
                  }}
                  disabled={!!gameId}
                  className="bg-gray-800 hover:bg-gray-700 py-1 rounded text-xs font-bold"
                >
                  ×
                </button>
                <button
                  onClick={() => {
                    playSound("click");
                    setBetAmount(user?.balance || 0);
                  }}
                  disabled={!!gameId}
                  className="bg-gray-800 hover:bg-gray-700 py-1 rounded text-xs font-bold"
                >
                  MAX
                </button>
              </div>
            </div>

            <div className="bg-gray-900/80 backdrop-blur rounded-lg p-4 border border-red-500/30">
              <label className="block text-xs mb-2 text-gray-300 font-semibold">
                ⚡ DIFFICULTY
              </label>
              <div className="grid grid-cols-5 gap-1">
                {DIFFICULTIES.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      playSound("click");
                      setDifficulty(d.id);
                    }}
                    disabled={!!gameId}
                    className={`py-2 rounded text-xs font-bold transition-smooth ${
                      difficulty === d.id
                        ? "bg-red-600 text-white scale-105 shadow-lg shadow-red-600/50"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                    }`}
                  >
                    <div className="text-lg">{d.icon}</div>
                    <div className="text-[10px]">{d.name}</div>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">
                {DIFFICULTIES.find((d) => d.id === difficulty)?.tiles} tiles •{" "}
                {DIFFICULTIES.find((d) => d.id === difficulty)?.blocks} block •{" "}
                {DIFFICULTIES.find((d) => d.id === difficulty)?.rows} rows
              </p>
            </div>

            {!gameId && !gameOver && (
              <button
                onClick={startGame}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 py-4 rounded-lg font-bold text-xl transition-smooth transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-green-600/50"
              >
                {loading ? "⏳ Starting..." : "🎮 START GAME"}
              </button>
            )}

            {gameId && currentRow > 0 && (
              <button
                onClick={cashout}
                className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 py-4 rounded-lg font-bold text-xl animate-pulse-glow transition-smooth transform hover:scale-[1.02]"
              >
                💰 CASH OUT ({potentialWin} coins)
              </button>
            )}

            {gameOver && (
              <button
                onClick={startGame}
                className="w-full bg-red-600 hover:bg-red-700 py-4 rounded-lg font-bold text-xl transition-smooth"
              >
                🔄 PLAY AGAIN
              </button>
            )}

            {gameId && (
              <div className="bg-gray-900/80 backdrop-blur rounded-lg p-3 border border-red-500/30 grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-gray-400 text-xs">Multiplier</p>
                  <p className="text-lg font-bold text-red-400">{multiplier}x</p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Row</p>
                  <p className="text-lg font-bold text-white">
                    {currentRow}/{totalRows}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-xs">Win</p>
                  <p className="text-lg font-bold text-green-400">
                    {potentialWin}
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="bg-gradient-to-b from-black to-blue-950/30 rounded-2xl p-4 md:p-6 border-2 border-blue-500/40 shadow-2xl shadow-blue-600/20">
              <div className="flex flex-col-reverse gap-2">
                {Array.from({ length: totalRows }).map((_, rowIdx) => {
                  const isCompleted = rowIdx < currentRow;
                  const isCurrent = rowIdx === currentRow;
                  const isLocked = rowIdx > currentRow;
                  const revealedTile = revealedRows.find(
                    (r) => r.row === rowIdx
                  );

                  return (
                    <div
                      key={rowIdx}
                      className={`flex justify-center gap-2 transition-smooth ${
                        isCurrent ? "scale-105" : ""
                      }`}
                    >
                      <div className="w-8 flex items-center justify-center text-xs text-gray-500">
                        {rowIdx + 1}
                      </div>
                      {Array.from({ length: tilesPerRow }).map((_, tileIdx) => {
                        const isRevealed =
                          revealedTile && revealedTile.tileIndex === tileIdx;
                        const isSafeTile =
                          gameOver &&
                          safeTiles[rowIdx] &&
                          safeTiles[rowIdx].includes(tileIdx);

                        let tileColor =
                          "bg-gradient-to-br from-blue-800 to-blue-950 border-blue-600 hover:from-blue-700 hover:to-blue-900";

                        if (isRevealed) {
                          tileColor =
                            "bg-gradient-to-br from-green-500 to-green-700 border-green-400 animate-bounce-in";
                        } else if (isSafeTile && gameOver) {
                          tileColor =
                            "bg-gradient-to-br from-green-500 to-green-700 border-green-400 animate-shake";
                        } else if (isCompleted || isLocked) {
                          tileColor =
                            "bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700";
                        }

                        return (
                          <button
                            key={tileIdx}
                            onClick={() => revealTile(tileIdx)}
                            disabled={!isCurrent || !gameId || gameOver}
                            className={`w-16 h-16 md:w-20 md:h-20 rounded-lg text-3xl font-bold transition-smooth transform hover:scale-105 active:scale-95 border-2 shadow-lg ${tileColor} disabled:cursor-not-allowed disabled:hover:scale-100`}
                          >
                            {isRevealed ? "💎" : isSafeTile ? "💎" : "❓"}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-gray-900/80 backdrop-blur rounded-lg p-3 border border-red-500/30 max-h-[600px] overflow-y-auto">
              <p className="text-xs mb-2 text-gray-300 font-semibold sticky top-0 bg-gray-900 py-1">
                📊 MULTIPLIER LADDER
              </p>
              <div className="space-y-1">
                {ladder.map((mult, i) => (
                  <div
                    key={i}
                    className={`flex justify-between items-center px-2 py-1 rounded text-xs transition-smooth ${
                      currentRow === i + 1
                        ? "bg-yellow-600/40 border border-yellow-500 scale-105 font-bold"
                        : currentRow > i + 1
                        ? "bg-green-600/20 text-green-400"
                        : "bg-gray-800/50 text-gray-400"
                    }`}
                  >
                    <span className="font-mono">Row {i + 1}</span>
                    <span className="font-bold">{mult}x</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageBackground>
  );
}

export default Tower;