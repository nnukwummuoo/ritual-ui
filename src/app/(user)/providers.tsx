"use client";

import { Provider } from "react-redux";
import { store } from "@/store/store";
import { AuthProvider } from "@/lib/context/auth-context";
import { SnackbarProvider } from "notistack";
import { Suspense } from "react";
import { SNACKBAR_OPTIONS } from "@/constants";

const Loader = () => (
  <div className="w-screen flex items-center justify-center h-screen">
    <p>Loading</p>
  </div>
);

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <SnackbarProvider {...SNACKBAR_OPTIONS}>
        <AuthProvider>
          <Suspense fallback={<Loader />}>{children}</Suspense>
        </AuthProvider>
      </SnackbarProvider>
    </Provider>
  );
}
