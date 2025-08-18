"use client";
import React from 'react';
import { Mainpost } from './Mainpost';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { loginAuthUser } from '@/store/registerSlice';

function Upload() {
  const loggedInFromStore = useSelector((state: any) => state?.register?.logedin);
  const dispatch = useDispatch();
  const [login, setLogin] = useState<boolean>(false);
  const [ready, setReady] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      // 1) If Redux already knows user is logged in, trust it
      if (typeof loggedInFromStore === 'boolean' && loggedInFromStore) {
        setLogin(true);
        setReady(true);
        return;
      }

      // 2) Ask server using cookie-based session check
      try {
        const res = await fetch('/api/auth/status', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json().catch(() => ({ loggedIn: false }));
          if (data?.loggedIn) {
            setLogin(true);
            setReady(true);
            return;
          }
        }
      } catch {}

      // 3) Fallback to localStorage validation
      try {
        const ls = typeof window !== 'undefined' ? localStorage.getItem('login') : null;
        if (ls) {
          try {
            const parsed = JSON.parse(ls);
            const valid = !!(parsed?.accesstoken || parsed?.token || parsed?.userID);
            if (valid) {
              // Hydrate Redux so rest of the app is aware
              try { dispatch(loginAuthUser(parsed)); } catch {}
              setLogin(true);
            } else { setLogin(false); }
          } catch {
            setLogin(true);
          }
        } else {
          // 4) Finally, look for common auth cookies
          const cookieNames = ['session=', 'accessToken=', 'accesstoken=', 'token=', 'refreshToken='];
          const hasAuthCookie = typeof document !== 'undefined' && document.cookie.split('; ').some(c => cookieNames.some(n => c.startsWith(n)));
          setLogin(hasAuthCookie);
        }
      } finally {
        setReady(true);
      }
    })();
  }, [loggedInFromStore, dispatch]);

  // const handleRedirect = () => {
  //   navigate('/');
  // };

  return (
    <div style={{ padding: 10, paddingTop: 40 }}>
      {ready && !login && (
        <div className="fixed w-full inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-5 px-10 rounded-lg shadow-lg text-center flex flex-col items-center gap-4">
            <p className="text-lg font-semibold text-gray-800">Please login to continue</p>
            <Link href={"/login"}
              className="bg-orange-600 text-white px-4 py-2 rounded font-semibold"
            >
              OK
            </Link>
          </div>
        </div>
      )}
      {ready && login && <Mainpost />}
      {!ready && (
        <div className="w-full flex items-center justify-center py-10 text-gray-400">Checking authentication…</div>
      )}
    </div>
  );
}

export default Upload;
