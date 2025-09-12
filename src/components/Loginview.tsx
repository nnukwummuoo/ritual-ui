"use client";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "material-react-toastify";
import Input from "./Input";
import { login } from "@/lib/service/login";
import Processing from "./tick-animation/LoginProcessing";
import { useAuth } from "@/lib/context/auth-context";
import { revalidate } from "@/lib/utils/revalidate";
import { isRegistered } from "@/lib/service/manageSession";
import toastError from "./ToastError";

import type { Session } from "@/lib/context/auth-context";
type LoginResponse = Session & { accessToken?: string };

type User = {
  email: string;
  password: string;
  _id?: string;
  id?: string;
  refreshtoken?: string;
  accesstoken?: string;
  accessToken?: string;
  modelId?: string;
  isModel?: boolean;
};

export const Loginview = () => {
  const [loginError, setLoginError] = useState<string | null>(null);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { setIsLoggedIn, setStatus, isLoggedIn, status } = useAuth();
  const [user, setUser] = useState<User | undefined>();

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    try {
      const { email, password, errors } = login(formData);

      if (errors?.length)
        return toastError({ message: "Please input your email and password!" });
      if (!acceptedTerms)
        return toastError({
          message:
            "Attempted Login: Accept the Terms and Conditions to proceed.",
        });

      const res = await isRegistered({ email, password });
      console.log(res);
      if (!res?.email?.length) throw Error("No user found");

      // Save to localStorage for useUserId hook
      try {
       localStorage.setItem(
  "login",
  JSON.stringify({
    email: res.email,
    password: res.password,
    userID: res._id || res.id,
    refreshtoken: res.refreshtoken,
    accesstoken: res.accessToken || res.accesstoken,
    modelId: res.modelId,
    isModel: res.isModel,
    firstname: res.firstname,   // add this if backend sends it
    lastname: res.lastname,     // add this too
    fullName: res.fullName || `${res.firstname ?? ""} ${res.lastname ?? ""}`.trim(),
  })
);
      } catch (e) {
        console.error("[Login] Failed to save localStorage:", e);
      }

      setUser(res);
      setIsLoggedIn(true);
    } catch (error) {
      console.log(error);
      setUser({ email: "", password: "" });
      toastError({ message: "Login failed!" });
    } finally {
      setTimeout(() => {
        setStatus("resolved");
        revalidate("/");
        // Removed setIsLoggedIn(false) to keep session
      }, 3000);
    }
  }

  function checkAcceptTerms() {
    if (acceptedTerms) setStatus("checking");
  }

  useEffect(() => {
    async function createSession() {
      if (!user?.email?.length && !user?.password?.length) return;
      try {
        const result = await fetch(
          process.env.NEXT_PUBLIC_URL + "/api/session",
          {
            method: "POST",
            body: JSON.stringify({ email: user.email, password: user.password }),
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const data = await result.text();
        console.log(data);
      } catch (error) {
        console.log(error);
      }
    }
    createSession();
  }, [user]);

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
          <Input type="email" placeholder="Email Address" />
          <Input type="password" />
          <input type="hidden" name="signing-type" value={"login"} />
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
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 rounded shadow transition"
            onClick={checkAcceptTerms}
          >
            Log In
          </button>

          <p className="text-blue-500 text-sm text-center hover:text-blue-400 cursor-pointer">
            Forgot Password?
          </p>

          <p className="text-gray-400 text-sm text-center mt-4">
            Don't have an account?{" "}
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