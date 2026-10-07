import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get("/api/admin/dashboard", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (res.data.success) setStats(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, [user]);

  if (!stats)
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-xl text-gray-400">Loading...</div>
      </div>
    );

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-red-500">
          👑 Admin Dashboard
        </h1>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-gray-900 p-4 rounded-lg border border-red-500/20">
            <p className="text-gray-400 text-sm">Total Users</p>
            <p className="text-3xl font-bold text-red-500">
              {stats.totalUsers}
            </p>
          </div>
          <div className="bg-gray-900 p-4 rounded-lg border border-red-500/20">
            <p className="text-gray-400 text-sm">Total Bets</p>
            <p className="text-3xl font-bold text-white">{stats.totalBets}</p>
          </div>
          <div className="bg-gray-900 p-4 rounded-lg border border-red-500/20">
            <p className="text-gray-400 text-sm">Coins in Circulation</p>
            <p className="text-3xl font-bold text-yellow-400">
              {stats.totalCoins}
            </p>
          </div>
          <div className="bg-gray-900 p-4 rounded-lg border border-red-500/20">
            <p className="text-gray-400 text-sm">Pending Bets</p>
            <p className="text-3xl font-bold text-yellow-400">
              {stats.pendingBets}
            </p>
          </div>
          <div className="bg-gray-900 p-4 rounded-lg border border-red-500/20">
            <p className="text-gray-400 text-sm">Won Bets</p>
            <p className="text-3xl font-bold text-green-400">
              {stats.wonBets}
            </p>
          </div>
          <div className="bg-gray-900 p-4 rounded-lg border border-red-500/20">
            <p className="text-gray-400 text-sm">Lost Bets</p>
            <p className="text-3xl font-bold text-red-400">
              {stats.lostBets}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;