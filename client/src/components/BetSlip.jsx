import { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

function BetSlip({ match, pick, pickName, odds, onClose, onSuccess }) {
  const [amount, setAmount] = useState(100);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { user, updateBalance } = useAuth();

  const handlePlaceBet = async () => {
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
        "/api/bets",
        {
          matchId: match.id,
          matchName: match.name,
          pick,
          pickName,
          amount: Number(amount),
          odds: Number(odds),
        },
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      if (res.data.success) {
        updateBalance(res.data.newBalance);
        onSuccess();
        onClose();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Bet failed");
    } finally {
      setLoading(false);
    }
  };

  const potentialWin = (Number(amount) * Number(odds)).toFixed(2);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-xl font-bold text-green-400">Place Bet</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <p className="text-sm text-gray-400">Match</p>
          <p className="font-semibold">{match.name}</p>
        </div>

        <div className="mb-4 flex justify-between">
          <div>
            <p className="text-sm text-gray-400">Pick</p>
            <p className="font-semibold text-green-400">{pickName}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-400">Odds</p>
            <p className="font-semibold">{odds}x</p>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm mb-1 text-gray-300">
            Stake (coins)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min="1"
            className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 focus:outline-none focus:border-green-500"
          />
          <p className="text-xs text-gray-400 mt-1">
            Balance: {user?.balance} coins
          </p>
        </div>

        <div className="mb-4 bg-gray-700 rounded p-3">
          <p className="text-sm text-gray-300">
            Potential Win:{" "}
            <span className="text-green-400 font-bold">{potentialWin} coins</span>
          </p>
        </div>

        {error && (
          <div className="bg-red-600 text-white p-2 rounded mb-3 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handlePlaceBet}
          disabled={loading}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 py-2 rounded font-semibold"
        >
          {loading ? "Placing..." : `Bet ${amount} coins`}
        </button>
      </div>
    </div>
  );
}

export default BetSlip;