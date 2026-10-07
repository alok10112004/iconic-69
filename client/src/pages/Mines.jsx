import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import PageBackground from "../components/PageBackground";
import { playSound } from "../utils/sounds";

function Mines() {
  const { user, updateBalance } = useAuth();
  const [betAmount, setBetAmount] = useState(100);
  const [mineCount, setMineCount] = useState(3);
  const [gameId, setGameId] = useState(null);
  const [revealed, setRevealed] = useState([]);
  const [mines, setMines] = useState([]);
  const [multiplier, setMultiplier] = useState(1);
  const [potentialWin, setPotentialWin] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const startGame = async () => {
    playSound("click");
    setLoading(true);
    setMessage("");
    setRevealed([]);
    setMines([]);
    setMultiplier(1);
    setPotentialWin(0);
    setGameOver(false);

    try {
      const res = await axios.post(
        "/api/casino/mines/start",
        { betAmount: Number(betAmount), mineCount: Number(mineCount) },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      if (res.data.success) {
        setGameId(res.data.gameId);
        updateBalance(res.data.newBalance);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to start");
    } finally {
      setLoading(false);
    }
  };

  const revealTile = async (index) => {
    if (!gameId || gameOver || revealed.includes(index)) return;

    playSound("click");

    try {
      const res = await axios.post(
        "/api/casino/mines/reveal",
        { gameId, tileIndex: index },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      if (res.data.hitMine) {
        playSound("lose");
        setMines(res.data.mines);
        setGameOver(true);
        setMessage("💥 You hit a mine! Game over.");
        setGameId(null);
      } else {
        playSound("coin");
        setRevealed(res.data.revealed);
        setMultiplier(res.data.multiplier);

        if (res.data.allRevealed) {
          playSound("win");
          setGameOver(true);
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
        "/api/casino/mines/cashout",
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
      setMessage(err.response?.data?.message || "Cashout failed");
    }
  };

  const getTileColor = (index) => {
    if (mines.includes(index)) return "bg-red-600";
    if (revealed.includes(index)) return "bg-green-600";
    return "bg-gray-800 hover:bg-gray-700 border border-red-500/20";
  };

  const getTileContent = (index) => {
    if (mines.includes(index)) return "💣";
    if (revealed.includes(index)) return "💎";
    return "";
  };

  return (
    <PageBackground>
      <div className="max-w-2xl mx-auto text-white animate-fadeIn">
        <h1 className="text-3xl font-bold mb-6 text-red-500">💣 Mines</h1>

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

        {!gameId && !gameOver && (
          <div className="bg-gray-900/80 backdrop-blur rounded-lg p-4 border border-red-500/30 mb-4 space-y-4">
            <div>
              <label className="block text-sm mb-1 text-gray-300">
                Bet Amount
              </label>
              <input
                type="number"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                className="w-full bg-black border border-red-500/30 rounded px-3 py-2 text-white"
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-gray-300">
                Mines: {mineCount}
              </label>
              <input
                type="range"
                min="1"
                max="24"
                value={mineCount}
                onChange={(e) => setMineCount(e.target.value)}
                className="w-full accent-red-500"
              />
            </div>

            <button
              onClick={startGame}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 py-3 rounded font-bold transition-smooth"
            >
              {loading ? "Starting..." : "Start Game"}
            </button>
          </div>
        )}

        {gameId && (
          <div className="bg-gray-900/80 backdrop-blur rounded-lg p-4 border border-red-500/30 mb-4 grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-gray-400 text-xs">Multiplier</p>
              <p className="text-xl font-bold text-red-400">{multiplier}x</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Revealed</p>
              <p className="text-xl font-bold text-white">{revealed.length}</p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Potential Win</p>
              <p className="text-xl font-bold text-green-400">
                {potentialWin}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-5 gap-2 mb-4">
          {Array.from({ length: 25 }).map((_, i) => (
            <button
              key={i}
              onClick={() => revealTile(i)}
              disabled={!gameId || gameOver || revealed.includes(i)}
              className={`aspect-square rounded-lg text-2xl font-bold transition-smooth ${getTileColor(
                i
              )} disabled:cursor-not-allowed transform hover:scale-105 active:scale-95`}
            >
              {getTileContent(i)}
            </button>
          ))}
        </div>

        {gameId && revealed.length > 0 && (
          <button
            onClick={cashout}
            className="w-full bg-green-600 hover:bg-green-700 py-3 rounded font-bold text-lg animate-pulse-glow transition-smooth"
          >
            💰 Cash Out ({potentialWin} coins)
          </button>
        )}

        {gameOver && (
          <button
            onClick={startGame}
            className="w-full bg-red-600 hover:bg-red-700 py-3 rounded font-bold text-lg transition-smooth"
          >
            🔄 Play Again
          </button>
        )}
      </div>
    </PageBackground>
  );
}

export default Mines;