import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import PageBackground from "../components/PageBackground";

function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/api/auth/profile", {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        if (res.data.success) setProfile(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchProfile();
  }, [user]);

  if (loading) {
    return (
      <PageBackground>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-xl text-gray-400">Loading profile...</div>
        </div>
      </PageBackground>
    );
  }

  if (!profile) {
    return (
      <PageBackground>
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="text-xl text-red-500">Profile not found</div>
        </div>
      </PageBackground>
    );
  }

  const { user: userData, stats } = profile;

  return (
    <PageBackground>
      <div className="max-w-4xl mx-auto text-white">
        <h1 className="text-3xl font-bold mb-6 text-red-500">👤 Profile</h1>

        <div className="bg-gray-900/80 backdrop-blur rounded-lg p-6 border border-red-500/30 mb-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center text-2xl font-bold text-white">
              {userData.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {userData.name}
              </h2>
              <p className="text-gray-400 text-sm">{userData.email}</p>
              <span className="text-xs bg-red-600/20 text-red-400 px-2 py-0.5 rounded mt-1 inline-block uppercase">
                {userData.role}
              </span>
            </div>
          </div>
          <div className="border-t border-red-500/20 pt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-400 text-xs">Balance</p>
              <p className="text-2xl font-bold text-red-500">
                {userData.balance} coins
              </p>
            </div>
            <div>
              <p className="text-gray-400 text-xs">Member Since</p>
              <p className="text-lg font-semibold text-white">
                {new Date(userData.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-red-400 mb-3">📊 Betting Stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-gray-900/80 backdrop-blur rounded-lg p-4 border border-red-500/20">
            <p className="text-gray-400 text-xs">Total Bets</p>
            <p className="text-2xl font-bold text-white">{stats.totalBets}</p>
          </div>
          <div className="bg-gray-900/80 backdrop-blur rounded-lg p-4 border border-green-500/20">
            <p className="text-gray-400 text-xs">Won</p>
            <p className="text-2xl font-bold text-green-400">
              {stats.wonBets}
            </p>
          </div>
          <div className="bg-gray-900/80 backdrop-blur rounded-lg p-4 border border-red-500/20">
            <p className="text-gray-400 text-xs">Lost</p>
            <p className="text-2xl font-bold text-red-400">{stats.lostBets}</p>
          </div>
          <div className="bg-gray-900/80 backdrop-blur rounded-lg p-4 border border-yellow-500/20">
            <p className="text-gray-400 text-xs">Pending</p>
            <p className="text-2xl font-bold text-yellow-400">
              {stats.pendingBets}
            </p>
          </div>
        </div>

        <div className="bg-gray-900/80 backdrop-blur rounded-lg p-6 border border-red-500/30 mb-6">
          <div className="flex justify-between items-center mb-2">
            <p className="text-gray-400 text-sm">Win Rate</p>
            <p className="text-2xl font-bold text-red-500">
              {stats.winRate}%
            </p>
          </div>
          <div className="w-full bg-black rounded-full h-3 overflow-hidden">
            <div
              className="bg-gradient-to-r from-red-600 to-red-400 h-full transition-all duration-500"
              style={{ width: `${stats.winRate}%` }}
            ></div>
          </div>
        </div>

        <h2 className="text-xl font-bold text-red-400 mb-3">
          💰 Financial Stats
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-gray-900/80 backdrop-blur rounded-lg p-4 border border-red-500/20">
            <p className="text-gray-400 text-xs">Wagered</p>
            <p className="text-lg font-bold text-white">
              {stats.totalWagered}
            </p>
          </div>
          <div className="bg-gray-900/80 backdrop-blur rounded-lg p-4 border border-red-500/20">
            <p className="text-gray-400 text-xs">Payout</p>
            <p className="text-lg font-bold text-green-400">
              {stats.totalPayout.toFixed(2)}
            </p>
          </div>
          <div className="bg-gray-900/80 backdrop-blur rounded-lg p-4 border border-red-500/20">
            <p className="text-gray-400 text-xs">Deposited</p>
            <p className="text-lg font-bold text-white">
              {stats.totalDeposited}
            </p>
          </div>
          <div className="bg-gray-900/80 backdrop-blur rounded-lg p-4 border border-red-500/20">
            <p className="text-gray-400 text-xs">Withdrawn</p>
            <p className="text-lg font-bold text-white">
              {stats.totalWithdrawn}
            </p>
          </div>
        </div>
      </div>
    </PageBackground>
  );
}

export default Profile;