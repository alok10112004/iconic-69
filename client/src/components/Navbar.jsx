import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setMenuOpen(false);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <nav className="bg-black border-b border-red-500/30 px-4 py-3 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center">
          <Link
            to="/"
            className="text-xl font-bold text-red-500"
            onClick={closeMenu}
          >
            🏏 Iconic 69
          </Link>

          {user && (
            <div className="flex items-center gap-2 md:hidden">
              <span className="text-sm text-red-400 font-semibold">
                💰 {user.balance}
              </span>
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="text-white text-2xl px-2"
              >
                {menuOpen ? "✕" : "☰"}
              </button>
            </div>
          )}

          {!user && (
            <div className="flex items-center gap-2 md:hidden">
              <Link
                to="/login"
                className="text-sm text-gray-300"
                onClick={closeMenu}
              >
                Login
              </Link>
              <Link
                to="/register"
                className="text-sm bg-red-600 text-white px-3 py-1 rounded"
                onClick={closeMenu}
              >
                Register
              </Link>
            </div>
          )}

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <>
                <Link to="/" className="text-sm text-gray-300 hover:text-red-400">
                  Home
                </Link>
                <Link
                  to="/matches"
                  className="text-sm text-gray-300 hover:text-red-400"
                >
                  Matches
                </Link>
                <Link
                  to="/my-bets"
                  className="text-sm text-gray-300 hover:text-red-400"
                >
                  My Bets
                </Link>
                <Link
                  to="/wallet"
                  className="text-sm text-gray-300 hover:text-red-400"
                >
                  Wallet
                </Link>
                <span className="text-sm text-red-400 font-semibold">
                  💰 {user.balance}
                </span>
                <Link
                  to="/profile"
                  className="text-sm text-gray-300 hover:text-red-400"
                >
                  Hi, {user.name}
                </Link>
                {user.role === "admin" && (
                  <>
                    <Link to="/admin" className="text-sm text-yellow-400">
                      Dashboard
                    </Link>
                    <Link to="/admin/bets" className="text-sm text-yellow-400">
                      Admin Bets
                    </Link>
                    <Link to="/admin/users" className="text-sm text-yellow-400">
                      Users
                    </Link>
                    <Link
                      to="/admin/deposits"
                      className="text-sm text-yellow-400"
                    >
                      Deposits
                    </Link>
                    <Link
                      to="/admin/withdrawals"
                      className="text-sm text-yellow-400"
                    >
                      Withdrawals
                    </Link>
                  </>
                )}
                <button
                  onClick={handleLogout}
                  className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm text-gray-300 hover:text-red-400"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>

        {menuOpen && user && (
          <div className="md:hidden mt-3 pt-3 border-t border-red-500/20 flex flex-col gap-3">
            <Link
              to="/"
              className="text-sm text-gray-300 hover:text-red-400"
              onClick={closeMenu}
            >
              Home
            </Link>
            <Link
              to="/matches"
              className="text-sm text-gray-300 hover:text-red-400"
              onClick={closeMenu}
            >
              Matches
            </Link>
            <Link
              to="/my-bets"
              className="text-sm text-gray-300 hover:text-red-400"
              onClick={closeMenu}
            >
              My Bets
            </Link>
            <Link
              to="/wallet"
              className="text-sm text-gray-300 hover:text-red-400"
              onClick={closeMenu}
            >
              Wallet
            </Link>
            <Link
              to="/profile"
              className="text-sm text-gray-300 hover:text-red-400"
              onClick={closeMenu}
            >
              Hi, {user.name}
            </Link>
            {user.role === "admin" && (
              <>
                <div className="text-xs text-gray-500 uppercase mt-2">
                  Admin
                </div>
                <Link
                  to="/admin"
                  className="text-sm text-yellow-400"
                  onClick={closeMenu}
                >
                  Dashboard
                </Link>
                <Link
                  to="/admin/bets"
                  className="text-sm text-yellow-400"
                  onClick={closeMenu}
                >
                  Admin Bets
                </Link>
                <Link
                  to="/admin/users"
                  className="text-sm text-yellow-400"
                  onClick={closeMenu}
                >
                  Users
                </Link>
                <Link
                  to="/admin/deposits"
                  className="text-sm text-yellow-400"
                  onClick={closeMenu}
                >
                  Deposits
                </Link>
                <Link
                  to="/admin/withdrawals"
                  className="text-sm text-yellow-400"
                  onClick={closeMenu}
                >
                  Withdrawals
                </Link>
              </>
            )}
            <button
              onClick={handleLogout}
              className="text-sm bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded mt-2"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;