"use client";

import { ToastContainer } from "material-react-toastify";
import "material-react-toastify/dist/ReactToastify.css";

export default function ToastProvider() {
  return (
    <ToastContainer 
      position="top-center" 
      theme="dark"
      style={{ zIndex: 99999 }}
      toastClassName="!z-[99999]"
      bodyClassName="!z-[99999]"
    />
  );
}
