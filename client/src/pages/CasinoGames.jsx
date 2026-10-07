import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PageBackground from "../components/PageBackground";

function CasinoGames() {
  const { user } = useAuth();

  const games = [
    {
      id: "dice",
      name: "Dice",
      icon: "🎲",
      path: "/casino",
      desc: "Roll under/over",
      color: "from-red-600 to-red-800",
    },
    {
      id: "mines",
      name: "Mines",
      icon: "💣",
      path: "/mines",
      desc: "Find safe tiles",
      color: "from-orange-600 to-orange-800",
    },
    {
      id: "plinko",
      name: "Plinko",
      icon: "🎯",
      path: "/plinko",
      desc: "Drop the ball",
      color: "from-yellow-600 to-yellow-800",
    },
    {
      id: "coinflip",
      name: "Coin Flip",
      icon: "🪙",
      path: "/coinflip",
      desc: "Heads or Tails",
      color: "from-green-600 to-green-800",
    },
    {
      id: "roulette",
      name: "Roulette",
      icon: "🎡",
      path: "/roulette",
      desc: "Spin the wheel",
      color: "from-blue-600 to-blue-800",
    },
    {
      id: "crash",
      name: "Crash",
      icon: "✈️",
      path: "/crash",
      desc: "Cash out before crash",
      color: "from-purple-600 to-purple-800",
    },
    {
      id: "tower",
      name: "Tower",
      icon: "🗼",
      path: "/tower",
      desc: "Climb to the top",
      color: "from-blue-600 to-blue-800",
    },
    
  ];

  return (
    <PageBackground>
      <div className="max-w-6xl mx-auto text-white">
        <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-2xl p-6 md:p-8 mb-6 shadow-2xl shadow-purple-600/30">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-2">
            🎰 Casino Games
          </h1>
          <p className="text-purple-100 text-sm md:text-base">
            Balance:{" "}
            <span className="font-bold text-white text-lg">
              💰 {user?.balance?.toFixed(2)} coins
            </span>
          </p>
        </div>

        <h2 className="text-2xl font-bold text-red-500 mb-4">
          🎮 Choose Your Game
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {games.map((game) => (
            <Link
              key={game.id}
              to={game.path}
              className={`bg-gradient-to-br ${game.color} rounded-xl p-6 hover:scale-105 transform transition duration-200 shadow-lg`}
            >
              <div className="text-5xl mb-3">{game.icon}</div>
              <h3 className="text-xl font-bold text-white mb-1">
                {game.name}
              </h3>
              <p className="text-white/80 text-sm">{game.desc}</p>
            </Link>
          ))}
        </div>

        <div className="mt-6 bg-gray-900/80 backdrop-blur rounded-lg p-4 border border-red-500/20">
          <p className="text-center text-gray-400 text-sm">
            🎰 Aur games jald aa rahe hain — Teen Patti, Baccarat, Keno, Andar
            Bahar
          </p>
        </div>
      </div>
    </PageBackground>
  );
}

export default CasinoGames;