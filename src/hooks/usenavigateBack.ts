"use client";

import React from "react";

export default function useNavigateBack(){
    const [prevPageURL, setPrevPageURL] = React.useState<string>("")

    React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const absoluteUrl = window.location.href
      const prev: string = absoluteUrl?.split("/").slice(0,-1).join("/")
      setPrevPageURL(prev)
    }
  }, []);

    return prevPageURL
}