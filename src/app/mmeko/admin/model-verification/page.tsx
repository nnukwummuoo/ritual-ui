"use client";

import { useState, useEffect } from "react";
import ModelCard from "./_component/ModelCard";
import { useAuth } from "@/lib/context/auth-context";

export default function VerifyModels() {
  const { session } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (!session?.isAdmin) return null;

  return <ModelCard />;
}
