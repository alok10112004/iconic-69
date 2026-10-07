import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Home() {
  const { user } = useAuth();

  const sections = [
    {
      title: "🏏 Sports Betting",
      desc: "Cricket, Football, Tennis — live odds ke saath",
      path: "/matches",
      color: "from-red-600 to-red-800",
    },
    {
      title: "🎰 Casino Games",
      desc: "Dice, Mines, Plinko, Coin Flip, Roulette, Crash",
      path: "/casino-games",
      color: "from-purple-600 to-purple-800",
    },
    {
      title: "📋 My Bets",
      desc: "Apni saari bets dekho",
      path: "/my-bets",
      color: "from-blue-600 to-blue-800",
    },
    {
      title: "💰 Wallet",
      desc: "Deposit, Withdraw, Balance",
      path: "/wallet",
      color: "from-green-600 to-green-800",
    },
    {
      title: "👤 Profile",
      desc: "Apni stats dekho",
      path: "/profile",
      color: "from-yellow-600 to-yellow-800",
    },
    {
      title: "🏦 Bank Details",
      desc: "Withdrawal ke liye bank save karo",
      path: "/bank",
      color: "from-pink-600 to-pink-800",
    },
  ];

  return (
    <div className="min-h-screen relative p-4 bg-gradient-to-br from-black via-red-950/20 to-black">
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, red 1px, transparent 0)`,
          backgroundSize: "40px 40px",
        }}
      ></div>

      <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-red-600 to-red-800 rounded-2xl p-6 md:p-10 mb-6 shadow-2xl shadow-red-600/30">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-2">
            Welcome back, {user?.name}! 👋
          </h1>
          <p className="text-red-100 text-sm md:text-base">
            Balance:{" "}
            <span className="font-bold text-white text-lg">
              💰 {user?.balance} coins
            </span>
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-gray-900/80 backdrop-blur rounded-lg p-4 border border-red-500/20">
            <p className="text-gray-400 text-xs">Balance</p>
            <p className="text-xl font-bold text-red-500">{user?.balance}</p>
          </div>
          <div className="bg-gray-900/80 backdrop-blur rounded-lg p-4 border border-red-500/20">
            <p className="text-gray-400 text-xs">Status</p>
            <p className="text-xl font-bold text-green-400">Active</p>
          </div>
          <div className="bg-gray-900/80 backdrop-blur rounded-lg p-4 border border-red-500/20">
            <p className="text-gray-400 text-xs">Role</p>
            <p className="text-xl font-bold text-yellow-400 capitalize">
              {user?.role}
            </p>
          </div>
          <div className="bg-gray-900/80 backdrop-blur rounded-lg p-4 border border-red-500/20">
            <p className="text-gray-400 text-xs">Member</p>
            <p className="text-xl font-bold text-white">Since 2026</p>
          </div>
        </div>

        {/* Main Sections */}
        <h2 className="text-2xl font-bold text-red-500 mb-4">
          🎯 Quick Access
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((section) => (
            <Link
              key={section.path}
              to={section.path}
              className={`bg-gradient-to-br ${section.color} rounded-xl p-6 hover:scale-105 transform transition duration-200 shadow-lg`}
            >
              <h3 className="text-xl font-bold text-white mb-2">
                {section.title}
              </h3>
              <p className="text-white/80 text-sm">{section.desc}</p>
            </Link>
          ))}
        </div>

        {/* Admin Section */}
        {user?.role === "admin" && (
          <>
            <h2 className="text-2xl font-bold text-yellow-400 mb-4 mt-8">
              👑 Admin Panel
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                to="/admin"
                className="bg-gray-900/80 backdrop-blur rounded-lg p-4 border border-yellow-500/30 hover:border-yellow-500 transition text-center"
              >
                <p className="text-3xl mb-2">📊</p>
                <p className="text-sm font-semibold text-yellow-400">
                  Dashboard
                </p>
              </Link>
              <Link
                to="/admin/deposits"
                className="bg-gray-900/80 backdrop-blur rounded-lg p-4 border border-yellow-500/30 hover:border-yellow-500 transition text-center"
              >
                <p className="text-3xl mb-2">💸</p>
                <p className="text-sm font-semibold text-yellow-400">
                  Deposits
                </p>
              </Link>
              <Link
                to="/admin/withdrawals"
                className="bg-gray-900/80 backdrop-blur rounded-lg p-4 border border-yellow-500/30 hover:border-yellow-500 transition text-center"
              >
                <p className="text-3xl mb-2">🏦</p>
                <p className="text-sm font-semibold text-yellow-400">
                  Withdrawals
                </p>
              </Link>
              <Link
                to="/admin/users"
                className="bg-gray-900/80 backdrop-blur rounded-lg p-4 border border-yellow-500/30 hover:border-yellow-500 transition text-center"
              >
                <p className="text-3xl mb-2">👥</p>
                <p className="text-sm font-semibold text-yellow-400">Users</p>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Home;