import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Matches from "./pages/Matches";
import MatchDetails from "./pages/MatchDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MyBets from "./pages/MyBets";
import Wallet from "./pages/Wallet";
import Profile from "./pages/Profile";
import BankDetails from "./pages/BankDetails";
import Casino from "./pages/Casino";
import Plinko from "./pages/Plinko";
import Mines from "./pages/Mines";
import CoinFlip from "./pages/CoinFlip";
import Roulette from "./pages/Roulette";
import Crash from "./pages/Crash";
import Tower from "./pages/Tower";
import CasinoGames from "./pages/CasinoGames";
import Dashboard from "./pages/admin/Dashboard";
import AdminBets from "./pages/admin/Bets";
import AdminUsers from "./pages/admin/Users";
import AdminWithdrawals from "./pages/admin/Withdrawals";
import AdminDeposits from "./pages/admin/Deposits";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-white p-8">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="text-white p-8">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  if (user.role !== "admin") return <Navigate to="/" />;
  return children;
}

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/matches" element={<PrivateRoute><Matches /></PrivateRoute>} />
        <Route path="/match/:sport/:id" element={<PrivateRoute><MatchDetails /></PrivateRoute>} />
        <Route path="/my-bets" element={<PrivateRoute><MyBets /></PrivateRoute>} />
        <Route path="/wallet" element={<PrivateRoute><Wallet /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/bank" element={<PrivateRoute><BankDetails /></PrivateRoute>} />
        <Route path="/casino-games" element={<PrivateRoute><CasinoGames /></PrivateRoute>} />
        <Route path="/casino" element={<PrivateRoute><Casino /></PrivateRoute>} />
        <Route path="/plinko" element={<PrivateRoute><Plinko /></PrivateRoute>} />
        <Route path="/mines" element={<PrivateRoute><Mines /></PrivateRoute>} />
        <Route path="/coinflip" element={<PrivateRoute><CoinFlip /></PrivateRoute>} />
        <Route path="/roulette" element={<PrivateRoute><Roulette /></PrivateRoute>} />
        <Route path="/crash" element={<PrivateRoute><Crash /></PrivateRoute>} />
        <Route path="/tower" element={<PrivateRoute><Tower /></PrivateRoute>} />
        <Route path="/admin" element={<AdminRoute><Dashboard /></AdminRoute>} />
        <Route path="/admin/bets" element={<AdminRoute><AdminBets /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/withdrawals" element={<AdminRoute><AdminWithdrawals /></AdminRoute>} />
        <Route path="/admin/deposits" element={<AdminRoute><AdminDeposits /></AdminRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;