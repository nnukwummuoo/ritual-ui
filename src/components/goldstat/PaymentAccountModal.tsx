import React, { useState, useEffect } from "react";
import { URL } from "../../api/config";
import CountrySelect from "../CountrySelect/CountrySelect";

interface PaymentAccount {
  _id: string;
  method: "crypto";
  fullName: string;
  email: string;
  phone?: string;
  country: string;
  currency: string;
  cryptoType: "BTC" | "USDT_TRC20" | "USDT_ERC20";
  walletAddress: string;
}

interface PaymentAccountModalProps {
  accesstoken: string | undefined;
  userId: string | undefined;
}

interface FormData {
  fullName?: string;
  email?: string;
  phone?: string;
  country?: string;
  currency?: string;
  cryptoType?: "BTC" | "USDT_TRC20" | "USDT_ERC20";
  walletAddress?: string;
}

const PaymentAccountModal: React.FC<PaymentAccountModalProps> = ({ accesstoken, userId }) => {
  const [showModal, setShowModal] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({});
  const [agree, setAgree] = useState<boolean>(false);
  const [account, setAccount] = useState<PaymentAccount | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isFetchingAccount, setIsFetchingAccount] = useState<boolean>(true);

  const fetchAccount = async () => {
    if (!userId || !accesstoken) {
      setIsFetchingAccount(false);
      return;
    }
    setIsFetchingAccount(true);
    try {
      const res = await fetch(`${URL}/addpayment/check-account/${userId}`, {
        headers: {
          Authorization: `Bearer ${accesstoken}`,
        },
      });
      const data: { exists: boolean; account?: PaymentAccount } = await res.json();
      if (res.ok && data.exists) {
        setAccount(data.account ?? null);
      } else {
        setAccount(null);
      }
    } catch (err) {
      console.error("Error fetching account:", err);
      setAccount(null);
    } finally {
      setIsFetchingAccount(false);
    }
  };

  useEffect(() => {
    fetchAccount();
  }, [userId, accesstoken]);

  const handleDeleteAccount = async () => {
    if (!account || !window.confirm("Are you sure you want to delete this account?")) return;

    setLoading(true);
    try {
      const res = await fetch(`${URL}/addpayment/${userId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accesstoken}`,
        },
      });

      const data: { message: string } = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to delete account.");
        return;
      }

      alert("Account deleted successfully.");
      setAccount(null);
    } catch (err) {
      console.error(err);
      alert("Something went wrong while deleting.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) {
      alert("Please confirm the acknowledgment checkbox.");
      return;
    }

    const payload = {
      method: "crypto",
      ...formData,
    };

    setLoading(true);
    try {
      const res = await fetch(`${URL}/addpayment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accesstoken}`,
        },
        body: JSON.stringify(payload),
      });

      const data: { message: string; data: PaymentAccount } = await res.json();

      if (!res.ok) {
        alert(data.message || "Submission failed");
        return;
      }

      alert("✅ Account saved successfully!");
      setShowModal(false);
      setFormData({});
      setAgree(false);
      await fetchAccount();
    } catch (err) {
      console.error(err);
      alert("❌ Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const renderInput = (
    name: string,
    placeholder: string,
    type: string = "text",
    required: boolean = true
  ) => (
    <div className="flex flex-col gap-1">
      <label className="text-left text-sm text-gray-300">{placeholder}</label>
      <input
        type={type}
        name={name}
        required={required}
        placeholder={placeholder}
        className="border border-gray-600 rounded-md text-white bg-gray-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
      />
    </div>
  );

  const renderSelect = (
    name: string,
    label: string,
    options: { value: string; label: string }[]
  ) => (
    <div className="flex flex-col gap-1">
      <label className="text-left text-sm text-gray-300">{label}</label>
      <select
        name={name}
        required
        className="border border-gray-600 text-white bg-gray-700 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
        onChange={(e) => setFormData({ ...formData, [name]: e.target.value })}
      >
        <option value="">Select {label}</option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="text-black">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <>
      <div className="bg-gray-800 w-full px-4 py-3 rounded-lg shadow-sm mb-3">
        <div className="w-full flex flex-wrap items-center justify-between gap-2">
          {isFetchingAccount ? (
            <p className="text-sm text-gray-400 animate-pulse">Checking for account...</p>
          ) : (
            <p className="text-sm text-gray-300">
              {account
                ? `Crypto Account: ${account.cryptoType} (${account.walletAddress.slice(
                    0,
                    6
                  )}...${account.walletAddress.slice(-4)})`
                : "Securely link your crypto account"}
            </p>
          )}

          {account ? (
            <button
              onClick={handleDeleteAccount}
              disabled={loading}
              className="bg-red-500 px-4 py-2 rounded-2xl text-white text-xs font-medium hover:bg-red-600 disabled:bg-red-400"
            >
              {loading ? "Deleting..." : "Remove Account"}
            </button>
          ) : (
            <button
              onClick={() => setShowModal(true)}
              disabled={isFetchingAccount}
              className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 px-4 py-2 rounded-2xl text-white text-xs font-medium active:bg-[#F9731670] hover:bg-[#F97316a7] disabled:opacity-50"
            >
              Add Account
            </button>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center px-4">
          <div className="bg-gray-800 rounded-xl w-full max-w-md p-6 shadow-lg text-white">
            <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-4 rounded-t-xl mb-4">
              <h2 className="text-xl font-bold text-center">Cryptocurrency Account Info</h2>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-left">
              {renderInput("fullName", "Full Name")}
              {renderInput("email", "Email Address", "email")}
              {renderInput("phone", "Phone Number (optional)", "tel", false)}
              <div className="flex flex-col gap-1">
                <label className="text-left text-sm text-gray-300">Country of Residence</label>
                <CountrySelect onSelectCountry={(country) => setFormData({ ...formData, country })} />
              </div>
              {renderSelect("cryptoType", "Cryptocurrency Type", [
                { value: "BTC", label: "Bitcoin (BTC)" },
                { value: "USDT_TRC20", label: "USDT (Tether, TRC20)" },
                { value: "USDT_ERC20", label: "USDT (Bep20, ERC20)" },
              ])}
              {renderInput("walletAddress", "Wallet Address")}

              <label className="flex items-start gap-2 text-sm text-gray-400">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="mt-1 accent-purple-500"
                />
                I confirm that the information above is correct and belongs to me. I understand that wrong or incomplete details may delay or block my payments.
              </label>

              <div className="flex justify-between gap-4">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 transition-all text-white font-bold px-6 py-2 rounded-lg w-full disabled:bg-gray-600"
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Save Account"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setFormData({});
                    setAgree(false);
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-medium px-6 py-2 rounded-lg w-full"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default PaymentAccountModal;