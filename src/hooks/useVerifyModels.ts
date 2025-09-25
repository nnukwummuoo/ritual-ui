// hooks/useVerifyModels.ts
"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/context/auth-context";
import {
  allrequestedmodel,
  handleApprove,
  handleReject,
} from "@/lib/admin_handler/server";

export interface ModelUser {
  userid: string;
  fullName: string;
  city: string;
  country: string;
  createdAt: string;
  _id: string;
  idPhoto: string;
  selfieWithId: string;
  Model_Application_status: "pending" | "accepted" | "rejected";
}

// Utility functions
export function formatDate(dateString: string) {
  if (!dateString) return null;
  const date = new Date(dateString);
  return `${date.getDate()}-${date.toLocaleString("default", {
    month: "long",
  })}-${date.getFullYear()}- ${date.toLocaleTimeString()}`;
}

export function capitalizeName(name: string) {
  return name
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function useVerifyModels() {
  const { session } = useAuth();
  const [users, setUsers] = useState<ModelUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchModels = async () => {
      if (!session?.accesstoken) return;
      setLoading(true);
      setError(null);
      try {
        const data = await allrequestedmodel(session.accesstoken);
        if (data?.users?.length) setUsers(data.users);
      } catch (err) {
        if (err instanceof Error)
          setError(err.message || "Failed to fetch models");
      } finally {
        setLoading(false);
      }
    };
    fetchModels();
  }, [session?.accesstoken]);

  const approve = async (userId: string) => {
    if (!session?.accesstoken) return;
    try {
      await handleApprove(userId, session.accesstoken);
      setUsers((prev) => prev.filter((u) => u.userid !== userId));
    } catch (err) {
      console.error(err);
    }
  };

  const reject = async (userId: string) => {
    if (!session?.accesstoken) return;
    try {
      await handleReject(userId, session.accesstoken);
      setUsers((prev) => prev.filter((u) => u.userid !== userId));
    } catch (err) {
      console.error(err);
    }
  };

  return { users, loading, error, approve, reject, formatDate, capitalizeName };
}
