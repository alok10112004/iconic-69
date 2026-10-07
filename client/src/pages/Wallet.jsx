import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import PageBackground from "../components/PageBackground";

function Wallet() {
  const { user, updateBalance } = useAuth();
  const [depositAmount, setDepositAmount] = useState(500);
  const [withdrawAmount, setWithdrawAmount] = useState(100);
  const [message, setMessage] = useState("");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [existingBank, setExistingBank] = useState(null);

  const fetchHistory = async () => {
    try {
      const res = await axios.get("/api/payments/history", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.data.success) setTransactions(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchBank = async () => {
    try {
      const res = await axios.get("/api/bank", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.data.success && res.data.data) {
        setExistingBank(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchHistory();
      fetchBank();
    }
  }, [user]);

  const handleDeposit = async () => {
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post(
        "/api/payments/deposit",
        { amount: Number(depositAmount) },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      if (res.data.success) {
        setMessage(
          "⏳ Deposit request submitted! Admin approval pending."
        );
        fetchHistory();
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Deposit failed");
    } finally {
      setLoading(false);
    }
  };

  const handleWithdraw = async () => {
    if (!existingBank) {
      setMessage("❌ Pehle bank details save karo");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post(
        "/api/payments/withdraw",
        { amount: Number(withdrawAmount) },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      if (res.data.success) {
        setMessage("⏳ Withdrawal request submitted! Admin approval pending.");
        fetchHistory();
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Withdrawal failed");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    if (status === "success")
      return "bg-green-500/20 text-green-400 border-green-500";
    if (status === "pending")
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500";
    if (status === "failed")
      return "bg-red-500/20 text-red-400 border-red-500";
    return "bg-gray-500/20 text-gray-400";
  };

  return (
    <PageBackground>
      <div className="max-w-4xl mx-auto text-white">
        <h1 className="text-3xl font-bold mb-6 text-red-500">💰 Wallet</h1>

        <div className="bg-gray-900/80 backdrop-blur rounded-lg p-6 border border-red-500/30 mb-6">
          <p className="text-gray-400 text-sm">Current Balance</p>
          <p className="text-4xl font-bold text-red-500 mt-2">
            {user?.balance}{" "}
            <span className="text-lg text-gray-400">coins</span>
          </p>
        </div>

        {message && (
          <div className="bg-blue-500/20 border border-blue-500 text-blue-300 p-3 rounded mb-6 text-sm">
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-900/80 backdrop-blur rounded-lg p-6 border border-red-500/30">
            <h2 className="font-semibold mb-3 text-red-400">
              💵 Deposit Request
            </h2>
            <input
              type="number"
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              className="w-full bg-black border border-red-500/30 rounded px-3 py-2 text-white mb-3"
            />
            <button
              onClick={handleDeposit}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 py-2 rounded font-semibold"
            >
              {loading ? "Submitting..." : `Deposit ${depositAmount} coins`}
            </button>
            <p className="text-xs text-gray-500 mt-2">
              Admin approval ke baad balance add hoga
            </p>
          </div>

          <div className="bg-gray-900/80 backdrop-blur rounded-lg p-6 border border-red-500/30">
            <h2 className="font-semibold mb-3 text-red-400">
              🏦 Withdraw Request
            </h2>

            {existingBank ? (
              <div className="bg-green-500/10 border border-green-500/30 rounded p-2 mb-3 text-xs">
                <p className="text-green-400 font-semibold">
                  ✅ {existingBank.bankName}
                </p>
                <p className="text-gray-400">
                  ••••{existingBank.accountNumber.slice(-4)}
                </p>
                <Link
                  to="/bank"
                  className="text-red-400 hover:text-red-300 text-xs mt-1 inline-block underline"
                >
                  Change Bank Details
                </Link>
              </div>
            ) : (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded p-2 mb-3 text-xs text-yellow-300">
                ⚠️ Bank details save karo
                <Link
                  to="/bank"
                  className="text-red-400 hover:text-red-300 ml-2 underline font-bold"
                >
                  Add Bank →
                </Link>
              </div>
            )}

            <input
              type="number"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="w-full bg-black border border-red-500/30 rounded px-3 py-2 text-white mb-3"
            />
            <button
              onClick={handleWithdraw}
              disabled={loading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 py-2 rounded font-semibold"
            >
              {loading
                ? "Submitting..."
                : `Request Withdraw ${withdrawAmount}`}
            </button>
          </div>
        </div>

        <div className="bg-gray-900/80 backdrop-blur rounded-lg p-6 border border-red-500/30">
          <h2 className="font-semibold mb-4 text-red-400">
            📜 Transaction History
          </h2>

          {transactions.length === 0 ? (
            <p className="text-gray-500 text-sm">No transactions yet</p>
          ) : (
            <div className="space-y-2">
              {transactions.map((t) => (
                <div
                  key={t._id}
                  className="flex justify-between items-center bg-black rounded p-3 border border-red-500/20"
                >
                  <div>
                    <p className="text-sm font-semibold capitalize">{t.type}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(t.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold ${
                        t.type === "deposit" || t.type === "payout"
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {t.type === "deposit" || t.type === "payout" ? "+" : "-"}
                      {t.amount}
                    </p>
                    <span
                      className={`text-xs px-2 py-0.5 rounded border ${getStatusBadge(
                        t.status
                      )}`}
                    >
                      {t.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PageBackground>
  );
}

export default Wallet;