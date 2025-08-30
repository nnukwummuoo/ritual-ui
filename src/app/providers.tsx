"use client";

import { Provider } from "react-redux";
import { store } from "@/store/store";
import { AuthProvider } from "@/lib/context/auth-context";
import { SnackbarProvider } from "notistack";
import { Suspense } from "react";
import { SNACKBAR_OPTIONS } from "@/constants";
import dynamic from "next/dynamic";
import "material-react-toastify/dist/ReactToastify.css";
// Install global Axios interceptor fallback
import "@/api/axiosSetup";

const Loader = () => (
  <div className="w-screen flex items-center justify-center h-screen">
    <p>Loading</p>
  </div>
);

export default function Providers({ children }: { children: React.ReactNode }) {
  const ClientToastContainer = dynamic(
    () => import("material-react-toastify").then((m) => m.ToastContainer),
    { ssr: false }
  );
  return (
    <Provider store={store}>
      <SnackbarProvider {...SNACKBAR_OPTIONS}>
        <AuthProvider>
          <ClientToastContainer position="top-center"/>
          <Suspense fallback={<Loader />}>{children}</Suspense>
        </AuthProvider>
      </SnackbarProvider>
    </Provider>
  );
}
