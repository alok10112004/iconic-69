import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const { user } = useAuth();

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/api/admin/users", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.data.success) setUsers(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [user]);

  const updateBalance = async (userId, newBalance) => {
    try {
      await axios.put(
        `/api/admin/user/${userId}/balance`,
        { balance: Number(newBalance) },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      fetchUsers();
    } catch (err) {
      alert("Failed");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-red-500">
          👥 Manage Users
        </h1>

        {users.length === 0 ? (
          <div className="text-gray-400 bg-gray-900 rounded-lg p-6 text-center border border-red-500/20">
            No users yet
          </div>
        ) : (
          <div className="space-y-3">
            {users.map((u) => (
              <div
                key={u._id}
                className="bg-gray-900 rounded-lg p-4 border border-red-500/20 flex justify-between items-center flex-wrap gap-3"
              >
                <div>
                  <p className="font-semibold text-white">{u.name}</p>
                  <p className="text-xs text-gray-400">{u.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400">Balance:</span>
                  <input
                    type="number"
                    defaultValue={u.balance}
                    onBlur={(e) => updateBalance(u._id, e.target.value)}
                    className="bg-black border border-red-500/30 rounded px-2 py-1 w-32 text-sm text-white focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-400">coins</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminUsers;