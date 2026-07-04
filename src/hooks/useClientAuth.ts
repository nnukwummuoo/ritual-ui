"use client";

import { useEffect, useState } from "react";
import Cookies from "js-cookie";

export default function useClientAuth(initialAuth: boolean) {
    const [isAuth, setIsAuth] = useState(initialAuth);
    const [user, setUser] = useState<any>(null);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        // Read user from localStorage (matching bottom-navbar.tsx logic)
        try {
            const raw = localStorage.getItem("login");
            if (raw) {
                const data = JSON.parse(raw);
                const localUserid = data?.userID || data?.userid || data?.id || '';
                const localToken = data?.accesstoken || data?.refreshtoken || '';

                if (localUserid && localToken) {
                    setUser(data);
                    setToken(localToken);
                    setIsAuth(true);
                    return;
                }
            }
        } catch (e) {
            // Silent error handling
        }

        // Fallback to cookie
        const cookieToken = Cookies.get("session");
        if (cookieToken) {
            setToken(cookieToken);
            setIsAuth(true);
            return;
        }

        // No auth
        setIsAuth(false);
        setUser(null);
        setToken(null);
    }, []);

    return { isAuth, user, token };
}
