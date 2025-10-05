"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { ToastContainer } from "material-react-toastify";
import Input from "./Input";
import Processing from "./tick-animation/LoginProcessing";
import { useAuth } from "@/lib/context/auth-context";
import { isRegistered } from "@/lib/service/manageSession";
import toastError from "./ToastError";
// Removed unused imports to fix linting errors



type User = {
  nickname: string;
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
};

export const Loginview = () => {
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { setIsLoggedIn, setStatus, isLoggedIn, status } = useAuth();
  const [user, setUser] = useState<User | undefined>();

  // Debug status changes - removed to prevent console spam

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const nickname = formData.get("nickname")?.toString() || "";
      const password = formData.get("password")?.toString() || "";

      if (!nickname || !password) {
        return toastError({ message: "Please input your username and password!" });
      }
      if (!acceptedTerms) {
        return toastError({
          message: "Accept the Terms and Conditions to proceed.",
        });
      }

      // Set loading state
      setStatus("checking");

      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        setStatus("idle");
        toastError({ message: "Login request timed out. Please try again." });
      }, 10000); // 10 second timeout

      const res = await isRegistered({ nickname, password });
      
      // Clear timeout on successful response
      clearTimeout(timeoutId);
      console.log("Login response:", res);
      console.log("User data:", res?.user);
      
      if (!res?.user?.nickname?.length) {
        setStatus("idle");
        throw new Error(res?.error || "No user found");
      }

      // Create user object with all necessary data
      const userData = {
        ...res.user,
        password: password, // Store the password for session creation
        nickname: res.user.nickname,
        _id: res.user._id,
        accessToken: res.user.accessToken,
        refreshtoken: res.user.refreshtoken,
        firstname: res.user.firstname,
        lastname: res.user.lastname,
      };

      // Save to localStorage for useUserId hook
      try {
        localStorage.setItem(
          "login",
          JSON.stringify({
            nickname: res.user.nickname,
            userID: res.user._id,
            refreshtoken: res.user.refreshtoken,
            accesstoken: res.user.accessToken,
            firstname: res.user.firstname,
            lastname: res.user.lastname, 
          })
        );
      } catch (e) {
        console.error("[Login] Failed to save localStorage:", e);
      }

      setUser(userData);
      setIsLoggedIn(true);
      setStatus("resolved");
      
      // Create session immediately after successful login (like registration)
      try {
        const sessionResult = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/session`, {
          method: "POST",
          body: JSON.stringify({ 
            nickname: userData.nickname, 
            password: password 
          }),
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        });
        console.log("Session creation result:", await sessionResult.text());
      } catch (sessionError) {
        console.error("Session creation error:", sessionError);
      }
      
      // Redirect after successful login
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
      
    } catch (error) {
      console.error("Login error:", error);
      setUser({ nickname: "", password: "" });
      setStatus("idle");
      
      // Clear any pending timeouts
      const timeoutId = setTimeout(() => {}, 0);
      clearTimeout(timeoutId);
      
      const errorMessage = error instanceof Error ? error.message : "Login failed!";
      toastError({ message: errorMessage });
    }
  }

  // Session creation is now handled immediately after successful login (like registration)

  return (
    <div
      className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white px-4"
      style={{
        position: "fixed",
        right: 0,
        top: 0,
        bottom: 0,
        margin: "0 10px",
        width: "90%",
        maxWidth: "450px",
      }}
    >
      <ToastContainer position="top-center" theme="dark" />
      <div className="bg-gray-800 rounded-lg shadow-lg p-6 w-full max-w-md">
        <h1 className="bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent text-3xl font-bold text-center">
          Welcome Back
        </h1>
        <p className="text-gray-400 text-center mt-2">
          Log in to access your account
        </p>
        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <div className="flex flex-col">
            <Input
              type="text"
              name="nickname"
              placeholder="@username"
              pattern="@[a-z0-9_]{3,15}"
              title="Username: @ followed by 3-15 lowercase letters, numbers, or _"
              required={true}
            />
            <label htmlFor="nickname" className="text-gray-400 text-sm mt-1">
              Username
            </label>
          </div>
          <div className="flex flex-col">
            <Input
              type="password"
              name="password"
              placeholder="Password"
              required={true}
            />
            <label htmlFor="password" className="text-gray-400 text-sm mt-1">
              Password
            </label>
          </div>
          <input type="hidden" name="signing-type" value="login" />
          <div className="flex items-center mt-4">
            <Input
              type="checkbox"
              id="terms"
              overide={true}
              classNames="mr-2"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
            />
            <label htmlFor="terms" className="text-gray-400 text-sm">
              I accept the{" "}
              <span className="text-blue-500 underline cursor-pointer">
                Terms and Conditions
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded shadow transition"
          >
            Log In
          </button>

         <p className="text-blue-500 text-sm text-center hover:text-blue-400">
            <Link 
              href="/forget-password"
              className="text-blue-500 font-bold hover:underline">
              Forgot Password?
            </Link>
          </p>

          <p className="text-gray-400 text-sm text-center mt-4">
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