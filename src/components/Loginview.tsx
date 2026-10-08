"use client";
import Link from "next/link";
import React, { useState } from "react";
import { ToastContainer } from "react-toastify";
import Input from "./Input";
import Processing from "./tick-animation/LoginProcessing";
import { useAuth } from "@/lib/context/auth-context";
import { toast } from "react-toastify";
import { FaHome, FaUser, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { loginAuthUser } from "@/store/registerSlice";
import type { AppDispatch } from "@/store/store";
import { Fingerprint } from "lucide-react";
import { isBiometricAvailable, loginWithBiometric } from "@/lib/service/webauthn";



type User = {
  username: string;
  password: string;
  _id?: string;
  firstname?: string;
  lastname?: string;
  refreshtoken?: string;
  accessToken?: string;
  age?: string;
  country?: string;
  dob?: string;
  gender?: string;
  admin?: boolean;
  active?: boolean;
  balance?: string;
  passcode?: string;
  fullName?: string;
  bio?: string;
  photolink?: string;
  photoID?: string;
  withdrawbalance?: string;
  coinBalance?: number;
  earnings?: number;
  pending?: number;
  creator_verified?: boolean;
  creator_portfolio?: boolean;
  creator_portfolio_id?: string;
  Creator_Application_status?: string;
  followers?: unknown[];
  following?: unknown[];
  isVip?: boolean;
  vipStartDate?: unknown;
  vipEndDate?: unknown;
  vipAutoRenewal?: boolean;
  vipCelebrationViewed?: unknown;
  createdAt?: string;
  updatedAt?: string;
};

type LoginResponse = {
  user?: User;
  error?: string;
  isAdmin?: boolean;
  userId?: string;
  accessToken?: string;
  token?: string;
};

export const Loginview = () => {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { setIsLoggedIn, setStatus, isLoggedIn, status } = useAuth();
  const [, setUser] = useState<User | undefined>();
  const [bioAvailable, setBioAvailable] = useState(false);
  const [bioLoading, setBioLoading] = useState(false);
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  React.useEffect(() => {
    isBiometricAvailable().then(setBioAvailable);
  }, []);

  // Shared by both password login and biometric login — persists the user,
  // updates Redux, creates the encrypted session cookie, and redirects home.
  async function finishLogin(resUser: User, passwordUsed: string) {
    const userData = {
      ...resUser,
      password: passwordUsed,
      username: resUser.username,
      _id: resUser._id,
      accessToken: resUser.accessToken,
      refreshtoken: resUser.refreshtoken
    };

    try {
      const userDataToStore = {
        username: resUser.username,
        userID: resUser._id,
        refreshtoken: resUser.refreshtoken,
        accesstoken: resUser.accessToken,
        firstname: resUser.firstname,
        lastname: resUser.lastname,
        bio: resUser.bio,
        photolink: resUser.photolink,
        photoID: resUser.photoID,
        gender: resUser.gender,
        age: resUser.age,
        country: resUser.country,
        dob: resUser.dob,
        balance: resUser.balance,
        withdrawbalance: resUser.withdrawbalance,
        coinBalance: resUser.coinBalance,
        earnings: resUser.earnings,
        pending: resUser.pending,
        creator_verified: resUser.creator_verified,
        creator_portfolio: resUser.creator_portfolio,
        creator_portfolio_id: resUser.creator_portfolio_id,
        Creator_Application_status: resUser.Creator_Application_status,
        followers: resUser.followers,
        following: resUser.following,
        isVip: resUser.isVip,
        vipStartDate: resUser.vipStartDate,
        vipEndDate: resUser.vipEndDate,
        vipAutoRenewal: resUser.vipAutoRenewal,
        vipCelebrationViewed: resUser.vipCelebrationViewed,
        active: resUser.active,
        admin: resUser.admin,
        passcode: resUser.passcode,
        createdAt: resUser.createdAt,
        updatedAt: resUser.updatedAt
      };

      localStorage.setItem("login", JSON.stringify(userDataToStore));
    } catch {
      // Failed to save localStorage - continue anyway
    }

    setUser(userData);
    setIsLoggedIn(true);
    setStatus("resolved");

    dispatch(loginAuthUser({
      email: userData.username,
      password: passwordUsed,
      message: "login_success",
      refreshtoken: userData.refreshtoken,
      accesstoken: userData.accessToken,
      userID: userData._id,
      creator_portfolio_id: userData.creator_portfolio_id,
      creator_portfolio: userData.creator_portfolio,
    }));

    try {
      const sessionData = {
        username: userData.username,
        password: passwordUsed,
        userId: userData._id,
        admin: resUser?.admin || false,
        _id: userData._id,
        accessToken: userData.accessToken,
        refreshtoken: userData.refreshtoken
      };

      const sessionResult = await fetch(`/api/session`, {
        method: "POST",
        body: JSON.stringify(sessionData),
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!sessionResult.ok) {
        console.error("Session creation failed:", sessionResult.status, sessionResult.statusText);
      }
    } catch (sessionError) {
      console.error("Session creation error:", sessionError);
    }

    toast.success("Login successful! Redirecting...", {
      position: "top-center",
      autoClose: 1000,
    });

    setTimeout(() => {
      window.location.href = "/";
    }, 1000);
  }

  async function handleBiometricLogin() {
    setBioLoading(true);
    setStatus("checking");
    try {
      const result = await loginWithBiometric();

      if (!result.ok || !result.user) {
        setStatus("idle");
        toast.error(result.error || "Biometric login failed", {
          position: "top-center",
          autoClose: 4000,
        });
        return;
      }

      await finishLogin(result.user as User, "");
    } catch {
      setStatus("idle");
      toast.error("Biometric login failed. Please try again or use your password.", {
        position: "top-center",
        autoClose: 4000,
      });
    } finally {
      setBioLoading(false);
    }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);

    try {
      const usernameInput = formData.get("username")?.toString().trim() || "";
      const username = usernameInput.startsWith("@")
        ? usernameInput
        : (usernameInput ? `@${usernameInput}` : "");
      const password = formData.get("password")?.toString() || "";

      if (!username || !password) {
        toast.error("Please input your username and password!", {
          position: "top-center",
          autoClose: 3000,
        });
        return;
      }

      if (!acceptedTerms) {
        toast.error("Accept the Terms and Conditions to proceed.", {
          position: "top-center",
          autoClose: 3000,
        });
        return;
      }

      // Set loading state
      setStatus("checking");

      let res: LoginResponse & { banned?: boolean };
try {
  const loginRes = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  res = await loginRes.json();
} catch (networkError) {
  setStatus("idle");
  toast.error("Network error — please check your connection and try again.", {
    position: "top-center",
    autoClose: 4000,
  });
  return;
}

      // Check if user is banned
      if (res?.banned) {
        setStatus("idle");
        toast.error(res?.error || "This account has been banned for violating our rules", {
          position: "top-center",
          autoClose: 5000,
        });

        // Clear any existing auth data
        if (typeof window !== "undefined") {
          localStorage.removeItem("login");
          localStorage.removeItem("user");
          sessionStorage.clear();
          document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        }

        // Redirect to banned page
        setTimeout(() => {
          router.push('/banned');
        }, 2000);
        return;
      }

      // Check if response contains an error
      if (res?.error) {
        setStatus("idle");

        // Display specific error messages from backend
        toast.error(res.error, {
          position: "top-center",
          autoClose: 4000,
        });
        return;
      }

      // Check if user data exists
      if (!res?.user?.username?.length) {
        setStatus("idle");
        toast.error("Login failed. Please try again.", {
          position: "top-center",
          autoClose: 3000,
        });
        return;
      }

      await finishLogin(res.user, password);

    } catch (error) {
      setUser({ username: "", password: "" });
      setStatus("idle");

      const errorMessage = error instanceof Error
        ? error.message
        : "Login failed! Please try again.";

      toast.error(errorMessage, {
        position: "top-center",
        autoClose: 4000,
      });
    }
  }

  return (
    <div className="w-full h-full overflow-hidden flex flex-col items-center justify-center">
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        style={{
          zIndex: 9999,
          top: '45px'
        }}
        className="!z-[99999]"
      />
      {/* Home Icon */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => router.push('/')}
          className="p-2 rounded-full hover:bg-white/10 transition-colors"
          title="Go to Home"
        >
          <FaHome className="text-2xl text-[#bec8fa]" />
        </button>
      </div>

      {/* Brand mark */}
      <div className="mb-6 flex flex-col items-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6c63ff] to-[#9b59f5] flex items-center justify-center font-extrabold text-white text-xl shadow-[0_12px_30px_-10px_rgba(108,99,255,0.6)] mb-4">
          M
        </div>
        <div className="flex items-center justify-center gap-2 mb-1.5">
          <span className="text-yellow-400 text-xs">⚡</span>
          <h1 className="text-white text-xs font-semibold tracking-wide">
            Meet Your Fans &nbsp;•&nbsp; Keep 100% &nbsp;•&nbsp; Stay Safe
          </h1>
        </div>
        <p className="text-[#94a3b8] text-xs text-center">
          Where Creators Meet With Dignity
        </p>
      </div>

      {/* Login Form */}
      <div
        className="rounded-2xl p-7 w-full border"
        style={{
          backgroundColor: '#111624',
          borderColor: 'rgba(255,255,255,0.07)',
          boxShadow: '0 30px 70px -25px rgba(0,0,0,0.65)',
        }}
      >
        <h2 className="bg-gradient-to-r from-[#6c63ff] to-[#9b59f5] bg-clip-text text-transparent text-2xl font-extrabold text-center mb-1.5">
          Welcome Back
        </h2>
        <p className="text-center mb-6 text-sm text-[#94a3b8]">
          Log in to access your account
        </p>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="relative">
            <FaUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] text-sm pointer-events-none" />
            <Input
              type="text"
              name="username"
              placeholder="@username"
              pattern="^@?[a-z0-9_]{3,15}$"
              title="Username: optional @ followed by 3-15 lowercase letters, numbers, or _"
              required={true}
              overide={true}
              classNames="w-full pl-10 pr-4 py-3 bg-white/[0.02] border border-white/10 rounded-xl text-white text-sm placeholder:text-[#64748b] focus:outline-none focus:border-[#6c63ff] focus:ring-1 focus:ring-[#6c63ff]/40 transition-colors"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
            />
          </div>

          <div className="relative">
            <FaLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] text-sm pointer-events-none" />
            <Input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              required={true}
              overide={true}
              classNames="w-full pl-10 pr-10 py-3 bg-white/[0.02] border border-white/10 rounded-xl text-white text-sm placeholder:text-[#64748b] focus:outline-none focus:border-[#6c63ff] focus:ring-1 focus:ring-[#6c63ff]/40 transition-colors"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#94a3b8] hover:text-white transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <FaEyeSlash className="text-sm" /> : <FaEye className="text-sm" />}
            </button>
          </div>

          <input type="hidden" name="signing-type" value="login" />

          <label className="flex items-center gap-2.5 cursor-pointer select-none">
            <Input
              type="checkbox"
              id="terms"
              overide={true}
              classNames="peer sr-only"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
            />
            <span
              className={`w-[18px] h-[18px] rounded-md border flex items-center justify-center shrink-0 transition-colors ${
                acceptedTerms
                  ? "bg-gradient-to-br from-[#6c63ff] to-[#9b59f5] border-transparent"
                  : "bg-white/[0.03] border-white/15"
              }`}
            >
              {acceptedTerms && (
                <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </span>
            <span className="text-xs text-[#94a3b8]">
              I accept the{" "}
              <span
                className="text-[#9b59f5] underline cursor-pointer hover:text-[#b48cf7]"
                onClick={(e) => { e.preventDefault(); router.push('/auth/T_&_C'); }}
              >
                Terms and Conditions
              </span>
            </span>
          </label>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-gradient-to-r from-[#6c63ff] to-[#9b59f5] text-white py-3.5 rounded-xl font-semibold text-sm shadow-[0_14px_30px_-10px_rgba(108,99,255,0.55)] hover:shadow-[0_16px_34px_-8px_rgba(108,99,255,0.65)] hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              Log In
            </button>

            {bioAvailable && (
              <button
                type="button"
                onClick={handleBiometricLogin}
                disabled={bioLoading}
                aria-label="Log in with biometrics"
                title="Log in with biometrics"
                className="shrink-0 w-[52px] flex items-center justify-center rounded-xl border border-[#9b59f5]/30 bg-[#9b59f5]/10 text-[#b48cf7] hover:bg-[#9b59f5]/20 active:scale-[0.96] transition-all disabled:opacity-60"
              >
                <Fingerprint className={`w-5 h-5 ${bioLoading ? "animate-pulse" : ""}`} />
              </button>
            )}
          </div>

          <p className="text-sm text-center">
            <Link
              href="/auth/forget-password"
              className="text-[#9b59f5] font-semibold hover:text-[#b48cf7] hover:underline underline-offset-2"
            >
              Forgot Password?
            </Link>
          </p>

          <p className="text-sm text-center mt-4 text-[#94a3b8]">
            Don&apos;t have an account?{" "}
            <Link
              className="text-[#9b59f5] font-semibold hover:text-[#b48cf7] hover:underline underline-offset-2"
              href="/auth/register"
            >
              Register
            </Link>
          </p>
        </form>
      </div>
      <Processing status={status} isLoggedIn={isLoggedIn} />
    </div>
  );
};