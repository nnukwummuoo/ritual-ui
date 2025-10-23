"use client"
import { useAuth } from '@/lib/context/auth-context'
import React from 'react'
import { PopUp } from './popup'

export default function ShouldRenderPopUp() {
  const { popup } = useAuth();
  const [hasMounted, setHasMounted] = React.useState(false);

  React.useEffect(() => {
    setHasMounted(true);
  }, []);


  if (!hasMounted) return null;
  if (popup === "open") return <PopUp />;
  return null;
}
