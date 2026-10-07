import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import PageBackground from "../components/PageBackground";

function MyBets() {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user, updateBalance } = useAuth();

  const fetchBets = async () => {
    try {
      const res = await axios.get("/api/bets/my", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.data.success) setBets(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchBets();
  }, [user]);

  const handleCashout = async (betId) => {
    if (!window.confirm("Cash out this bet?")) return;
    try {
      const res = await axios.post(
        `/api/bets/cashout/${betId}`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      if (res.data.success) {
        alert(res.data.message);
        updateBalance(res.data.newBalance);
        fetchBets();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Cashout failed");
    }
  };

  if (loading) {
    return (
      <PageBackground>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-xl text-gray-400">Loading bets...</div>
        </div>
      </PageBackground>
    );
  }

  const getStatusColor = (status) => {
    if (status === "won") return "bg-green-600";
    if (status === "lost") return "bg-red-600";
    return "bg-yellow-600";
  };

  return (
    <PageBackground>
      <div className="max-w-4xl mx-auto text-white">
        <h1 className="text-3xl font-bold mb-6 text-red-500">📋 My Bets</h1>

        {bets.length === 0 ? (
          <div className="text-gray-400 bg-gray-900/80 backdrop-blur rounded-lg p-6 text-center border border-red-500/20">
            Abhi tak koi bet nahi lagayi. Matches page pe jao aur bet lagao!
          </div>
        ) : (
          <div className="space-y-3">
            {bets.map((bet) => (
              <div
                key={bet._id}
                className="bg-gray-900/80 backdrop-blur rounded-lg p-4 border border-red-500/20"
              >
                <div className="flex justify-between items-start mb-2">
                  <h2 className="font-semibold text-sm text-white">
                    {bet.matchName}
                  </h2>
                  <span
                    className={`text-xs px-2 py-1 rounded uppercase font-bold ${getStatusColor(
                      bet.status
                    )}`}
                  >
                    {bet.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-sm mt-3">
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
                </div>

                {bet.status === "won" && (
                  <p className="text-green-400 text-sm mt-3 font-semibold">
                    🎉 Won: {bet.payout.toFixed(2)} coins
                  </p>
                )}
                {bet.status === "lost" && (
                  <p className="text-red-400 text-sm mt-3 font-semibold">
                    😢 Lost: {bet.amount} coins
                  </p>
                )}
                {bet.status === "pending" && (
                  <div className="mt-3 flex justify-between items-center flex-wrap gap-2">
                    <p className="text-yellow-400 text-sm font-semibold">
                      ⏳ Potential win:{" "}
                      {(bet.amount * bet.odds).toFixed(2)} coins
                    </p>
                    <button
                      onClick={() => handleCashout(bet._id)}
                      className="bg-yellow-600 hover:bg-yellow-700 px-4 py-1 rounded text-sm font-semibold"
                    >
                      💰 Cashout (80%)
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </PageBackground>
  );
}

export default MyBets;