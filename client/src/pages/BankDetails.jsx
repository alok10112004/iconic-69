import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import PageBackground from "../components/PageBackground";

function BankDetails() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    accountHolderName: "",
    accountNumber: "",
    ifscCode: "",
    bankName: "",
    branchName: "",
    upiId: "",
  });
  const [existing, setExisting] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchBank = async () => {
    try {
      const res = await axios.get("/api/bank", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      if (res.data.success && res.data.data) {
        setExisting(res.data.data);
        setForm({
          accountHolderName: res.data.data.accountHolderName || "",
          accountNumber: res.data.data.accountNumber || "",
          ifscCode: res.data.data.ifscCode || "",
          bankName: res.data.data.bankName || "",
          branchName: res.data.data.branchName || "",
          upiId: res.data.data.upiId || "",
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) fetchBank();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post("/api/bank", form, {
        headers: { Authorization: `Bearer ${user.token}` },
      });

      if (res.data.success) {
        setMessage("✅ Bank details saved successfully");
        setExisting(res.data.data);
        setTimeout(() => navigate("/wallet"), 1500);
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete bank details?")) return;
    try {
      await axios.delete("/api/bank", {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setExisting(null);
      setForm({
        accountHolderName: "",
        accountNumber: "",
        ifscCode: "",
        bankName: "",
        branchName: "",
        upiId: "",
      });
      setMessage("Bank details deleted");
    } catch (err) {
      setMessage("Failed to delete");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <PageBackground>
      <div className="max-w-2xl mx-auto text-white">
        <button
          onClick={() => navigate("/wallet")}
          className="mb-4 text-gray-400 hover:text-white text-sm"
        >
          ← Back to Wallet
        </button>

        <h1 className="text-3xl font-bold mb-6 text-red-500">
          🏦 Bank Details
        </h1>

        {message && (
          <div className="bg-blue-500/20 border border-blue-500 text-blue-300 p-3 rounded mb-6 text-sm">
            {message}
          </div>
        )}

        {existing && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
            <p className="text-green-400 text-sm font-semibold mb-2">
              ✅ Bank details on file
            </p>
            <button
              onClick={handleDelete}
              className="mt-3 text-xs bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
            >
              Delete Bank Details
            </button>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-gray-900/80 backdrop-blur rounded-lg p-6 border border-red-500/30 space-y-4"
        >
          <div>
            <label className="block text-sm mb-1 text-gray-300">
              Account Holder Name *
            </label>
            <input
              type="text"
              name="accountHolderName"
              value={form.accountHolderName}
              onChange={handleChange}
              required
              className="w-full bg-black border border-red-500/30 rounded px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1 text-gray-300">
                Account Number *
              </label>
              <input
                type="text"
                name="accountNumber"
                value={form.accountNumber}
                onChange={handleChange}
                required
                className="w-full bg-black border border-red-500/30 rounded px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-300">
                IFSC Code *
              </label>
              <input
                type="text"
                name="ifscCode"
                value={form.ifscCode}
                onChange={handleChange}
                required
                maxLength={11}
                className="w-full bg-black border border-red-500/30 rounded px-3 py-2 text-white uppercase"
              />
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-300">
                Bank Name *
              </label>
              <input
                type="text"
                name="bankName"
                value={form.bankName}
                onChange={handleChange}
                required
                className="w-full bg-black border border-red-500/30 rounded px-3 py-2 text-white"
              />
            </div>
            <div>
              <label className="block text-sm mb-1 text-gray-300">
                UPI ID (optional)
              </label>
              <input
                type="text"
                name="upiId"
                value={form.upiId}
                onChange={handleChange}
                className="w-full bg-black border border-red-500/30 rounded px-3 py-2 text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 py-3 rounded font-semibold text-lg"
          >
            {loading ? "Saving..." : "Save Bank Details"}
          </button>
        </form>
      </div>
    </PageBackground>
  );
}

export default BankDetails;