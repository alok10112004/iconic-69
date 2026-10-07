import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

function AdminDeposits() {
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const { user } = useAuth();

  const fetchData = async () => {
    try {
      const [dRes, wRes] = await Promise.all([
        axios.get("/api/admin/deposits", {
          headers: { Authorization: `Bearer ${user.token}` },
        }),
        axios.get("/api/admin/withdrawals", {
          headers: { Authorization: `Bearer ${user.token}` },
        }),
      ]);
      if (dRes.data.success) setDeposits(dRes.data.data);
      if (wRes.data.success) setWithdrawals(wRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const approveDeposit = async (id) => {
    if (!window.confirm("Approve this deposit?")) return;
    try {
      await axios.post(
        `/api/admin/approve-deposit/${id}`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed");
    }
  };

  const approveWithdrawal = async (id) => {
    if (!window.confirm("Approve this withdrawal?")) return;
    try {
      await axios.post(
        `/api/admin/approve-withdrawal/${id}`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed");
    }
  };

  const rejectWithdrawal = async (id) => {
    if (!window.confirm("Reject this withdrawal?")) return;
    try {
      await axios.post(
        `/api/admin/reject-withdrawal/${id}`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-red-500">
          💸 Deposits & Withdrawals
        </h1>

        {/* Deposits */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-yellow-400 mb-3">
            ⏳ Pending Deposits ({deposits.length})
          </h2>
          {deposits.length === 0 ? (
            <div className="bg-gray-900 rounded p-4 text-gray-500 border border-red-500/20">
              No pending deposits
            </div>
          ) : (
            <div className="space-y-3">
              {deposits.map((d) => (
                <div
                  key={d._id}
                  className="bg-gray-900 rounded-lg p-4 border border-red-500/20"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-white">
                        {d.userId?.name}
                      </p>
                      <p className="text-xs text-gray-400">{d.userId?.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Ref: {d.reference}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(d.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <p className="font-bold text-green-400 text-lg">
                      +{d.amount} coins
                    </p>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => approveDeposit(d._id)}
                      className="bg-green-600 hover:bg-green-700 px-4 py-1 rounded text-sm font-semibold"
                    >
                      ✅ Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Withdrawals */}
        <div>
          <h2 className="text-xl font-bold text-yellow-400 mb-3">
            ⏳ Pending Withdrawals ({withdrawals.length})
          </h2>
          {withdrawals.length === 0 ? (
            <div className="bg-gray-900 rounded p-4 text-gray-500 border border-red-500/20">
              No pending withdrawals
            </div>
          ) : (
            <div className="space-y-3">
              {withdrawals.map((w) => (
                <div
                  key={w._id}
                  className="bg-gray-900 rounded-lg p-4 border border-red-500/20"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-white">
                        {w.userId?.name}
                      </p>
                      <p className="text-xs text-gray-400">{w.userId?.email}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Ref: {w.reference}
                      </p>
                      <p className="text-xs text-gray-500">
                        Balance: {w.userId?.balance}
                      </p>
                    </div>
                    <p className="font-bold text-red-400 text-lg">
                      -{w.amount} coins
                    </p>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => approveWithdrawal(w._id)}
                      className="bg-green-600 hover:bg-green-700 px-4 py-1 rounded text-sm font-semibold"
                    >
                      ✅ Approve
                    </button>
                    <button
                      onClick={() => rejectWithdrawal(w._id)}
                      className="bg-red-600 hover:bg-red-700 px-4 py-1 rounded text-sm font-semibold"
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDeposits;