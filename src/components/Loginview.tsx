"use client";
import Link from "next/link";
import React, { useState } from "react";
import { ToastContainer } from "react-toastify";
import Input from "./Input";
import Processing from "./tick-animation/LoginProcessing";
import { useAuth } from "@/lib/context/auth-context";
import { isRegistered } from "@/lib/service/manageSession";
import "react-toastify/dist/ReactToastify.css";
import { toast } from "react-toastify";
import { FaHome } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { loginAuthUser } from "@/store/registerSlice";
import type { AppDispatch } from "@/store/store";



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
  const { setIsLoggedIn, setStatus, isLoggedIn, status } = useAuth();
  const [, setUser] = useState<User | undefined>();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();

  // Debug status changes - removed to prevent console spam

  // async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
  //   e.preventDefault();
  //   const formData = new FormData(e.currentTarget);

  //   try {
  //     const usernameInput = formData.get("username")?.toString().trim() || "";
  //     const username = usernameInput.startsWith("@") ? usernameInput : (usernameInput ? `@${usernameInput}` : "");
  //     const password = formData.get("password")?.toString() || "";

  //     if (!username || !password) {
  //       return toastError({ message: "Please input your username and password!" });
  //     }
  //     if (!acceptedTerms) {
  //       return toastError({
  //         message: "Accept the Terms and Conditions to proceed.",
  //       });
  //     }

  //     // Set loading state
  //     setStatus("checking");

  //         const res = await isRegistered({ username, password }) as LoginResponse & { banned?: boolean };

  //     // Check if user is banned
  //     if (res?.banned) {
  //       setStatus("idle");

  //       // Show ban message
  //       toastError({ 
  //         message: res?.error || "This account has been banned for violating our rules" 
  //       });

  //       // Clear any existing auth data
  //       if (typeof window !== "undefined") {
  //         localStorage.removeItem("login");
  //         localStorage.removeItem("user");
  //         sessionStorage.clear();
  //         // Clear cookies manually
  //         document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  //         document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  //       }

  //       // Redirect to banned page after a short delay to show the toast
  //       setTimeout(() => {
  //         router.push('/banned');
  //       }, 2000);
  //       return;
  //     }

  //     if (!res?.user?.username?.length) {
  //       setStatus("idle");
  //       throw new Error(res?.error || "No user found");
  //     }

  //     // Create user object with all necessary data
  //     const userData = {
  //       ...res.user,
  //       password: password, // Store the password for session creation
  //       username: res.user.username,
  //       _id: res.user._id,
  //       accessToken: res.user.accessToken,
  //       refreshtoken: res.user.refreshtoken
  //     };

  //     // Save all user information to localStorage
  //     try {
  //       const userDataToStore = {
  //         // Authentication data
  //         username: res.user.username,
  //         userID: res.user._id,
  //         refreshtoken: res.user.refreshtoken,
  //         accesstoken: res.user.accessToken,

  //         // Personal information
  //         firstname: res.user.firstname,
  //         lastname: res.user.lastname,
  //         bio: res.user.bio,
  //         photolink: res.user.photolink,
  //         photoID: res.user.photoID,
  //         gender: res.user.gender,
  //         age: res.user.age,
  //         country: res.user.country,
  //         dob: res.user.dob,

  //         // Financial information
  //         balance: res.user.balance,
  //         withdrawbalance: res.user.withdrawbalance,
  //         coinBalance: res.user.coinBalance,
  //         earnings: res.user.earnings,
  //         pending: res.user.pending,

  //         // Creator information
  //         creator_verified: res.user.creator_verified,
  //         creator_portfolio: res.user.creator_portfolio,
  //         creator_portfolio_id: res.user.creator_portfolio_id,
  //         Creator_Application_status: res.user.Creator_Application_status,

  //         // Social information
  //         followers: res.user.followers,
  //         following: res.user.following,

  //         // VIP information
  //         isVip: res.user.isVip,
  //         vipStartDate: res.user.vipStartDate,
  //         vipEndDate: res.user.vipEndDate,
  //         vipAutoRenewal: res.user.vipAutoRenewal,
  //         vipCelebrationViewed: res.user.vipCelebrationViewed,

  //         // Account information
  //         active: res.user.active,
  //         admin: res.user.admin,
  //         passcode: res.user.passcode,
  //         createdAt: res.user.createdAt,
  //         updatedAt: res.user.updatedAt
  //       };

  //       localStorage.setItem("login", JSON.stringify(userDataToStore));
  //     } catch {
  //       // Failed to save localStorage
  //     }

  //     setUser(userData);
  //     setIsLoggedIn(true);
  //     setStatus("resolved");

  //     // Update Redux state
  //     dispatch(loginAuthUser({
  //       email: userData.username, // Using username as email since email is not used
  //       password: password,
  //       message: "login_success",
  //       refreshtoken: userData.refreshtoken,
  //       accesstoken: userData.accessToken,
  //       userID: userData._id,
  //       creator_portfolio_id: userData.creator_portfolio_id,
  //       creator_portfolio: userData.creator_portfolio,
  //     }));

  //     // Create session immediately after successful login (like registration)
  //     try {
  //       const sessionData = { 
  //         username: userData.username, 
  //         password: password,
  //         userId: userData._id,
  //           admin: res.user?.admin || false,
  //         _id: userData._id,
  //         accessToken: userData.accessToken,
  //         refreshtoken: userData.refreshtoken
  //       };


  //       const sessionResult = await fetch(`/api/session`, {
  //         method: "POST",
  //         body: JSON.stringify(sessionData),
  //         credentials: "include",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       });

  //       if (!sessionResult.ok) {
  //         console.error("Session creation failed:", sessionResult.status, sessionResult.statusText);
  //       }
  //     } catch (sessionError) {
  //       console.error("Session creation error:", sessionError);
  //     }

  //     // Redirect after successful login
  //     setTimeout(() => {
  //       window.location.href = "/";
  //     }, 500);

  //   } catch (error) {
  //     setUser({ username: "", password: "" });
  //     setStatus("idle");

  //     const errorMessage = error instanceof Error ? error.message : "Login failed!";
  //     toastError({ message: errorMessage });
  //   }
  // }
  // async function handleLogin(e: React.FormEvent) {
  //   e.preventDefault();
  //   const formData = new FormData(e.currentTarget);

  //   try {
  //     const usernameInput = formData.get("username")?.toString().trim() || "";
  //     const username = usernameInput.startsWith("@") 
  //       ? usernameInput 
  //       : (usernameInput ? `@${usernameInput}` : "");
  //     const password = formData.get("password")?.toString() || "";

  //     if (!username || !password) {
  //       return toastError({ 
  //         message: "Please input your username and password!" 
  //       });
  //     }

  //     if (!acceptedTerms) {
  //       return toastError({ 
  //         message: "Accept the Terms and Conditions to proceed." 
  //       });
  //     }

  //     // Set loading state
  //     setStatus("checking");

  //     const res = await isRegistered({ username, password }) as LoginResponse & { banned?: boolean };

  //     // Check if user is banned
  //     if (res?.banned) {
  //       setStatus("idle");
  //       toastError({ 
  //         message: res?.error || "This account has been banned for violating our rules" 
  //       });

  //       // Clear any existing auth data
  //       if (typeof window !== "undefined") {
  //         localStorage.removeItem("login");
  //         localStorage.removeItem("user");
  //         sessionStorage.clear();
  //         document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  //         document.cookie = 'refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  //       }

  //       // Redirect to banned page
  //       setTimeout(() => {
  //         router.push('/banned');
  //       }, 2000);
  //       return;
  //     }

  //     // Check if response contains an error
  //     if (res?.error) {
  //       setStatus("idle");

  //       // Display specific error messages from backend
  //       toastError({ message: res.error });
  //       return;
  //     }

  //     // Check if user data exists
  //     if (!res?.user?.username?.length) {
  //       setStatus("idle");
  //       toastError({ 
  //         message: "Login failed. Please try again." 
  //       });
  //       return;
  //     }

  //     // Create user object with all necessary data
  //     const userData = {
  //       ...res.user,
  //       password: password,
  //       username: res.user.username,
  //       _id: res.user._id,
  //       accessToken: res.user.accessToken,
  //       refreshtoken: res.user.refreshtoken
  //     };

  //     // Save all user information to localStorage
  //     try {
  //       const userDataToStore = {
  //         // Authentication data
  //         username: res.user.username,
  //         userID: res.user._id,
  //         refreshtoken: res.user.refreshtoken,
  //         accesstoken: res.user.accessToken,
  //         // Personal information
  //         firstname: res.user.firstname,
  //         lastname: res.user.lastname,
  //         bio: res.user.bio,
  //         photolink: res.user.photolink,
  //         photoID: res.user.photoID,
  //         gender: res.user.gender,
  //         age: res.user.age,
  //         country: res.user.country,
  //         dob: res.user.dob,
  //         // Financial information
  //         balance: res.user.balance,
  //         withdrawbalance: res.user.withdrawbalance,
  //         coinBalance: res.user.coinBalance,
  //         earnings: res.user.earnings,
  //         pending: res.user.pending,
  //         // Creator information
  //         creator_verified: res.user.creator_verified,
  //         creator_portfolio: res.user.creator_portfolio,
  //         creator_portfolio_id: res.user.creator_portfolio_id,
  //         Creator_Application_status: res.user.Creator_Application_status,
  //         // Social information
  //         followers: res.user.followers,
  //         following: res.user.following,
  //         // VIP information
  //         isVip: res.user.isVip,
  //         vipStartDate: res.user.vipStartDate,
  //         vipEndDate: res.user.vipEndDate,
  //         vipAutoRenewal: res.user.vipAutoRenewal,
  //         vipCelebrationViewed: res.user.vipCelebrationViewed,
  //         // Account information
  //         active: res.user.active,
  //         admin: res.user.admin,
  //         passcode: res.user.passcode,
  //         createdAt: res.user.createdAt,
  //         updatedAt: res.user.updatedAt
  //       };

  //       localStorage.setItem("login", JSON.stringify(userDataToStore));
  //     } catch {
  //       // Failed to save localStorage - continue anyway
  //     }

  //     setUser(userData);
  //     setIsLoggedIn(true);
  //     setStatus("resolved");

  //     // Update Redux state
  //     dispatch(loginAuthUser({
  //       email: userData.username,
  //       password: password,
  //       message: "login_success",
  //       refreshtoken: userData.refreshtoken,
  //       accesstoken: userData.accessToken,
  //       userID: userData._id,
  //       creator_portfolio_id: userData.creator_portfolio_id,
  //       creator_portfolio: userData.creator_portfolio,
  //     }));

  //     // Create session
  //     try {
  //       const sessionData = {
  //         username: userData.username,
  //         password: password,
  //         userId: userData._id,
  //         admin: res.user?.admin || false,
  //         _id: userData._id,
  //         accessToken: userData.accessToken,
  //         refreshtoken: userData.refreshtoken
  //       };

  //       const sessionResult = await fetch(`/api/session`, {
  //         method: "POST",
  //         body: JSON.stringify(sessionData),
  //         credentials: "include",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       });

  //       if (!sessionResult.ok) {
  //         console.error("Session creation failed:", sessionResult.status, sessionResult.statusText);
  //       }
  //     } catch (sessionError) {
  //       console.error("Session creation error:", sessionError);
  //     }

  //     // Redirect after successful login
  //     setTimeout(() => {
  //       window.location.href = "/";
  //     }, 500);

  //   } catch (error) {
  //     setUser({ username: "", password: "" });
  //     setStatus("idle");

  //     const errorMessage = error instanceof Error 
  //       ? error.message 
  //       : "Login failed! Please try again.";

  //     toastError({ message: errorMessage });
  //   }
  // }
  //   // Session creation is now handled immediately after successful login (like registration)

  //   return (
  //     <div className="w-full h-full overflow-hidden flex flex-col items-center justify-center">
  //       <ToastContainer 
  //         position="top-center" 
  //         theme="dark" 
  //         style={{ zIndex: 99999 }}
  //         toastClassName="!z-[99999]"
  //         bodyClassName="!z-[99999]"
  //       />
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

      const res = await isRegistered({ username, password }) as LoginResponse & { banned?: boolean };

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

      // Create user object with all necessary data
      const userData = {
        ...res.user,
        password: password,
        username: res.user.username,
        _id: res.user._id,
        accessToken: res.user.accessToken,
        refreshtoken: res.user.refreshtoken
      };

      // Save all user information to localStorage
      try {
        const userDataToStore = {
          // Authentication data
          username: res.user.username,
          userID: res.user._id,
          refreshtoken: res.user.refreshtoken,
          accesstoken: res.user.accessToken,
          // Personal information
          firstname: res.user.firstname,
          lastname: res.user.lastname,
          bio: res.user.bio,
          photolink: res.user.photolink,
          photoID: res.user.photoID,
          gender: res.user.gender,
          age: res.user.age,
          country: res.user.country,
          dob: res.user.dob,
          // Financial information
          balance: res.user.balance,
          withdrawbalance: res.user.withdrawbalance,
          coinBalance: res.user.coinBalance,
          earnings: res.user.earnings,
          pending: res.user.pending,
          // Creator information
          creator_verified: res.user.creator_verified,
          creator_portfolio: res.user.creator_portfolio,
          creator_portfolio_id: res.user.creator_portfolio_id,
          Creator_Application_status: res.user.Creator_Application_status,
          // Social information
          followers: res.user.followers,
          following: res.user.following,
          // VIP information
          isVip: res.user.isVip,
          vipStartDate: res.user.vipStartDate,
          vipEndDate: res.user.vipEndDate,
          vipAutoRenewal: res.user.vipAutoRenewal,
          vipCelebrationViewed: res.user.vipCelebrationViewed,
          // Account information
          active: res.user.active,
          admin: res.user.admin,
          passcode: res.user.passcode,
          createdAt: res.user.createdAt,
          updatedAt: res.user.updatedAt
        };

        localStorage.setItem("login", JSON.stringify(userDataToStore));
      } catch {
        // Failed to save localStorage - continue anyway
      }

      setUser(userData);
      setIsLoggedIn(true);
      setStatus("resolved");

      // Update Redux state
      dispatch(loginAuthUser({
        email: userData.username,
        password: password,
        message: "login_success",
        refreshtoken: userData.refreshtoken,
        accesstoken: userData.accessToken,
        userID: userData._id,
        creator_portfolio_id: userData.creator_portfolio_id,
        creator_portfolio: userData.creator_portfolio,
      }));

      // Create session
      try {
        const sessionData = {
          username: userData.username,
          password: password,
          userId: userData._id,
          admin: res.user?.admin || false,
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

      // Show success message
      toast.success("Login successful! Redirecting...", {
        position: "top-center",
        autoClose: 1000,
      });

      // Redirect after successful login
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);

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
          className="p-2 rounded-full hover:bg-gray-700 transition-colors"
          title="Go to Home"
        >
          <FaHome className="text-2xl" style={{ color: '#bec8fa' }} />
        </button>
      </div>

      {/* Creator Pledge Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="text-yellow-400 text-sm mr-3">⚡</div>
          <h1 className="text-white text-sm font-bold">Meet Your Fans • Keep 100% • Stay Safe</h1>
        </div>
        <p className="text-white text-sm leading-relaxed text-left">
          Mmeko is the only platform where creators can host Fan Meets, Fan Dates, Fan Calls, Pay-Per-View Messages, and Exclusive Contents with a clear safety framework and keep 100% of their earnings. 
        </p>
      </div>

      {/* Login Form */}
      <div className="rounded-lg shadow-lg p-6 w-full" style={{ backgroundColor: '#191e37' }}>
        <h2 className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent text-3xl font-bold text-center mb-2">
          Welcome Back
        </h2>
        <p className="text-center mb-6" style={{ color: '#bec8fa' }}>
          Log in to access your account
        </p>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="flex flex-col">
            <Input
              type="text"
              name="username"
              placeholder="@username"
              pattern="^@?[a-z0-9_]{3,15}$"
              title="Username: optional @ followed by 3-15 lowercase letters, numbers, or _"
              required={true}
              classNames="border rounded-lg text-center"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
            />
          </div>
          <div className="flex flex-col">
            <Input
              type="password"
              name="password"
              placeholder="Password"
              required={true}
              classNames="border rounded-lg text-center"
            />
          </div>
          <input type="hidden" name="signing-type" value="login" />
          <div className="flex items-center">
            <Input
              type="checkbox"
              id="terms"
              overide={true}
              classNames="mr-2"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
            />
            <label htmlFor="terms" className="text-sm" style={{ color: '#bec8fa' }}>
              I accept the{" "}
              <span
                className="text-blue-500 underline cursor-pointer hover:text-blue-400"
                onClick={() => router.push('/auth/T_&_C')}
              >
                Terms and Conditions
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg shadow transition font-medium"
          >
            Log In
          </button>

          <p className="text-blue-500 text-sm text-center hover:text-blue-400">
            <Link
              href="/auth/forget-password"
              className="text-blue-500 font-bold hover:underline">
              Forgot Password?
            </Link>
          </p>

          <p className="text-sm text-center mt-4" style={{ color: '#bec8fa' }}>
            Don&apos;t have an account?{" "}
            <Link
              className="text-blue-500 font-bold hover:underline cursor-pointer"
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