import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

function AdminBets() {
  const [bets, setBets] = useState([]);
  const { user } = useAuth();

  const fetchBets = async () => {
    try {
      const res = await axios.get("/api/admin/bets", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.data.success) setBets(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBets();
  }, [user]);

  const settleBet = async (betId, result) => {
    try {
      await axios.post(
        `/api/admin/settle-bet/${betId}`,
        { result },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchBets();
    } catch (err) {
      alert(err.response?.data?.message || "Failed");
    }
  };

  const getStatusColor = (status) => {
    if (status === "won") return "bg-green-600";
    if (status === "lost") return "bg-red-600";
    return "bg-yellow-600";
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-red-500">
          📊 Manage Bets
        </h1>

        {bets.length === 0 ? (
          <div className="text-gray-400 bg-gray-900 rounded-lg p-6 text-center border border-red-500/20">
            No bets yet
          </div>
        ) : (
          <div className="space-y-3">
            {bets.map((bet) => (
              <div
                key={bet._id}
                className="bg-gray-900 rounded-lg p-4 border border-red-500/20"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-sm text-white">
                      {bet.matchName}
                    </p>
                    <p className="text-xs text-gray-400">
                      User: {bet.userId?.name} ({bet.userId?.email})
                    </p>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded uppercase font-bold ${getStatusColor(
                      bet.status
                    )}`}
                  >
                    {bet.status}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-3 text-sm mt-3">
                  <div>
                    <p className="text-gray-400 text-xs">Pick</p>
                    <p className="font-semibold text-red-400">
                      {bet.pickName}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Stake</p>
                    <p className="font-semibold text-white">
                      {bet.amount} coins
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Odds</p>
                    <p className="font-semibold text-white">{bet.odds}x</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Payout</p>
                    <p className="font-semibold text-white">
                      {bet.payout.toFixed(2)} coins
                    </p>
                  </div>
                </div>

                {bet.status === "pending" && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => settleBet(bet._id, "won")}
                      className="bg-green-600 hover:bg-green-700 px-4 py-1 rounded text-sm font-semibold"
                    >
                      Mark Won
                    </button>
                    <button
                      onClick={() => settleBet(bet._id, "lost")}
                      className="bg-red-600 hover:bg-red-700 px-4 py-1 rounded text-sm font-semibold"
                    >
                      Mark Lost
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminBets;