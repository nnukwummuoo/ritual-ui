"use client";
import { useAuth } from "@/lib/context/auth-context";
import BottomNavBar from "./bottom-navbar";

interface AuthAwareBottomNavProps {
  isAuthenticated: boolean;
}

export default function AuthAwareBottomNav({ isAuthenticated }: AuthAwareBottomNavProps) {
  const { isLoggedIn } = useAuth();
  
  // Use auth context instead of prop for better client-side state management
  const isUserAuthenticated = isLoggedIn || isAuthenticated;
  
  if (!isUserAuthenticated) return null;
  
  return <BottomNavBar />;
}

