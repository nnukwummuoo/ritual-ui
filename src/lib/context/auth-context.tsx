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
  token?: string;
  isAdmin?: boolean;
  refreshToken?: string;
  name?: string;
  firstname?: string;
  lastname?: string;
  bio?: string;
  photolink?: string;
  photoID?: string;
  gender?: string;
  age?: string;
  country?: string;
  dob?: string;
  gold?: number;
  balance?: string; // Balance from database (String type)
  withdrawbalance?: string;
  coinBalance?: number;
  earnings?: number;
  pending?: number;
  isCreator?: boolean;
  creator_verified?: boolean;
  creator_portfolio?: boolean;
  creator_portfolio_id?: string;
  Creator_Application_status?: string;
  followers?: string[];
  following?: string[];
  isVip?: boolean;
  vipStartDate?: Date | null;
  vipEndDate?: Date | null;
  vipAutoRenewal?: boolean;
  vipCelebrationViewed?: any;
  active?: boolean;
  passcode?: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

// Define the AuthContext type
interface AuthContextType {
  isOpen: boolean;
  toggle: () => void;
  isLoggedIn: boolean,
  setIsLoggedIn: (isLoggedIn: boolean) => void,
  status: status,
  setStatus: (status: status) => void,
  popup: popup,
  // expose session so pages can access user id/token
  session: Session | null,
  setSession: React.Dispatch<React.SetStateAction<Session | null>>
}

type ReducerAction<T = any> = {
  type: string;
  payload?: T;
};

type ReducerState<T = any> = T;

// Create the AuthContext
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialState: ReducerState<any> = {};

function reducer(state: ReducerState, action: ReducerAction){

  switch(action.type){
    case "" :
      return {
        ...state,

      }
      default:
            throw new Error("unknown action")
    }
}

// AuthProvider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false)
  const [status, setStatus] = useState<status>("idle")
  const [isOpen, setIsOpen] = useState(false);
  const [{}, dispatch] = useReducer(reducer, initialState)
  const [popup, setPopup] = useState<popup>("open")
  const [session, setSession] = useState<Session | null>(null)
  const pathname = usePathname()

  const router = useRouter();
  const pathName = usePathname();

  const toggle = () => setIsOpen((prev) => !prev);
  
  useEffect(()=>{pathname.includes("register") ? setPopup("close") : setPopup("open")},[pathname])
  // hydrate session from localStorage and handle session persistence
  useEffect(() => {
    const initializeSession = async () => {
      try {
        // First, check if we have session data in localStorage
        const raw = typeof window !== "undefined" ? localStorage.getItem("login") : null;
        if (raw) {
          const data = JSON.parse(raw) || {};
          setSession({
            _id: data.userID || data._id || data.id || "",
            nickname: data.nickname || "",
            token: data.accesstoken || data.accessToken || data.token || "",
            refreshToken: data.refreshtoken || data.refreshToken || data.token || "",
            isAdmin: data.admin ?? false, // Default to false if not provided
            name: data.name || "",
            firstname: data.firstname || "",
            lastname: data.lastname || "",
            bio: data.bio || "",
            photolink: data.photolink || "",
            photoID: data.photoID || "",
            gender: data.gender || "",
            age: data.age || "",
            country: data.country || "",
            dob: data.dob || "",
            balance: data.balance || "0", // Balance from database (String type)
            withdrawbalance: data.withdrawbalance || "0",
            coinBalance: data.coinBalance || 0,
            earnings: data.earnings || 0,
            pending: data.pending || 0,
            isCreator: data.creator_portfolio || false,
            creator_verified: data.creator_verified || false,
            creator_portfolio: data.creator_portfolio || false,
            creator_portfolio_id: data.creator_portfolio_id || "",
            Creator_Application_status: data.Creator_Application_status || "none",
            followers: data.followers || [],
            following: data.following || [],
            isVip: data.isVip || false,
            vipStartDate: data.vipStartDate || null,
            vipEndDate: data.vipEndDate || null,
            vipAutoRenewal: data.vipAutoRenewal || true,
            vipCelebrationViewed: data.vipCelebrationViewed || {},
            active: data.active || false,
            passcode: data.passcode || "",
            createdAt: data.createdAt || null,
            updatedAt: data.updatedAt || null
          });
          // Set isLoggedIn to true if we have valid session data
          if (data.nickname && (data.userID || data._id || data.id)) {
            setIsLoggedIn(true);
          }
        } else {
          // No localStorage data, check if we have session cookies
          // This will be handled by the middleware, but we can also check here
          // for cases where the user has session cookies but no localStorage
          const hasSessionCookie = document.cookie.includes('session=') || document.cookie.includes('auth_token=');
          if (hasSessionCookie) {
            // Try to validate the session by making a request to get user data
            try {
              const response = await fetch('/api/session', {
                method: 'GET',
                credentials: 'include',
              });
              if (response.ok) {
                const sessionData = await response.json();
                if (sessionData.valid && sessionData.user) {
                  // Session is valid, restore user data to localStorage
                  const userData = {
                    nickname: sessionData.user.nickname,
                    userID: sessionData.user.nickname, // Use nickname as ID for now
                    accesstoken: '', // Will be filled by backend
                    refreshtoken: '', // Will be filled by backend
                    // Include all user data from session
                    firstname: sessionData.user.firstname,
                    lastname: sessionData.user.lastname,
                    bio: sessionData.user.bio,
                    photolink: sessionData.user.photolink,
                    photoID: sessionData.user.photoID,
                    gender: sessionData.user.gender,
                    age: sessionData.user.age,
                    country: sessionData.user.country,
                    dob: sessionData.user.dob,
                    balance: sessionData.user.balance,
                    withdrawbalance: sessionData.user.withdrawbalance,
                    coinBalance: sessionData.user.coinBalance,
                    earnings: sessionData.user.earnings,
                    pending: sessionData.user.pending,
                    creator_verified: sessionData.user.creator_verified,
                    creator_portfolio: sessionData.user.creator_portfolio,
                    creator_portfolio_id: sessionData.user.creator_portfolio_id,
                    Creator_Application_status: sessionData.user.Creator_Application_status,
                    followers: sessionData.user.followers,
                    following: sessionData.user.following,
                    isVip: sessionData.user.isVip,
                    vipStartDate: sessionData.user.vipStartDate,
                    vipEndDate: sessionData.user.vipEndDate,
                    vipAutoRenewal: sessionData.user.vipAutoRenewal,
                    vipCelebrationViewed: sessionData.user.vipCelebrationViewed,
                    active: sessionData.user.active,
                    admin: sessionData.user.admin,
                    passcode: sessionData.user.passcode,
                    createdAt: sessionData.user.createdAt,
                    updatedAt: sessionData.user.updatedAt
                  };
                  
                  // Save to localStorage
                  localStorage.setItem('login', JSON.stringify(userData));
                  
                  // Set session state
                  setSession({
                    _id: userData.userID,
                    nickname: userData.nickname,
                    token: userData.accesstoken,
                    refreshToken: userData.refreshtoken,
                    isAdmin: userData.admin || false,
                    name: '',
                    firstname: userData.firstname,
                    lastname: userData.lastname,
                    bio: userData.bio,
                    photolink: userData.photolink,
                    photoID: userData.photoID,
                    gender: userData.gender,
                    age: userData.age,
                    country: userData.country,
                    dob: userData.dob,
                    gold: 0,
                    balance: userData.balance || '0',
                    withdrawbalance: userData.withdrawbalance || '0',
                    coinBalance: userData.coinBalance || 0,
                    earnings: userData.earnings || 0,
                    pending: userData.pending || 0,
                    isCreator: userData.creator_portfolio || false,
                    creator_verified: userData.creator_verified || false,
                    creator_portfolio: userData.creator_portfolio || false,
                    creator_portfolio_id: userData.creator_portfolio_id || '',
                    Creator_Application_status: userData.Creator_Application_status || 'none',
                    followers: userData.followers || [],
                    following: userData.following || [],
                    isVip: userData.isVip || false,
                    vipStartDate: userData.vipStartDate || null,
                    vipEndDate: userData.vipEndDate || null,
                    vipAutoRenewal: userData.vipAutoRenewal || true,
                    vipCelebrationViewed: userData.vipCelebrationViewed || {},
                    active: userData.active || false,
                    passcode: userData.passcode || '',
                    createdAt: userData.createdAt || null,
                    updatedAt: userData.updatedAt || null
                  });
                  
                  setIsLoggedIn(true);
                  console.log('Session restored from cookies');
                }
              }
            } catch (error) {
              console.log('Session cookie check failed:', error);
            }
          }
          
          // No session data, ensure user is logged out
          setIsLoggedIn(false);
          setSession(null);
        }
      } catch (e) {
        console.error('Session initialization error:', e);
        setIsLoggedIn(false);
        setSession(null);
      } finally {
        setLoading(false);
      }
    };

    initializeSession();
  }, []); // Run once on mount



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
      }}
    >
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