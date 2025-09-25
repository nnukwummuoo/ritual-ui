"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useReducer,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { popup, status } from "@/constants/status";

// Define the Session interface
export interface Session {
  _id?: string;
  nickname: string;
  accesstoken?: string;
  token?: string;
  isAdmin?: boolean;
  refreshToken?: string;
}

// Define the AuthContext type
interface AuthContextType {
  isOpen: boolean;
  toggle: () => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
  status: status;
  setStatus: (status: status) => void;
  popup: popup;
  // expose session so pages can access user id/token
  session: Session | null;
  setSession: React.Dispatch<React.SetStateAction<Session | null>>;
}

type ReducerAction<T = any> = {
  type: string;
  payload?: T;
};

type ReducerState<T = any> = T;

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialState: ReducerState<any> = {};

function reducer(state: ReducerState, action: ReducerAction) {
  switch (action.type) {
    case "":
      return {
        ...state,
      };
    default:
      throw new Error("unknown action");
  }
}

// AuthProvider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [status, setStatus] = useState<status>("idle");
  const [isOpen, setIsOpen] = useState(false);
  const [{}, dispatch] = useReducer(reducer, initialState);
  const [popup, setPopup] = useState<popup>("open");
  const [session, setSession] = useState<Session | null>(null);
  const pathname = usePathname();

  const router = useRouter();
  const pathName = usePathname();

  const toggle = () => setIsOpen((prev) => !prev);

  useEffect(() => {
    pathname.includes("register") ? setPopup("close") : setPopup("open");
  }, [pathname]);
  // hydrate session from localStorage to support pages expecting session
  useEffect(() => {
    try {
      const raw =
        typeof window !== "undefined" ? localStorage.getItem("login") : null;
      if (raw) {
        const data = JSON.parse(raw) || {};
        console.log("raw", data);
        setSession({
          _id: data.userID || data._id || data.id || "",
          nickname: data.nickname || "",
          accesstoken: data.accesstoken || data.accessToken || data.accesstoken,
          refreshToken: data.refreshtoken || data.refreshToken,
          isAdmin: data.isAdmin,
        });
        console.log("Is this from contet?", session);
      }
    } catch (e) {
      // ignore
    }
  }, [isLoggedIn, status]);

  return (
    <AuthContext.Provider
      value={{
        toggle,
        isOpen,
        isLoggedIn,
        setIsLoggedIn,
        status,
        setStatus,
        popup,
        session,
        setSession,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the AuthContext
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
