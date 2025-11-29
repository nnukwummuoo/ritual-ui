import React from "react";
import { Id, toast, ToastContainer } from "react-toastify";

export function useToast() {
  const toastId = React.useRef<Id | null>(null);

  const successalert = (
    message: string,
    type: "info" | "success" | "warning" | "error" = "info",
    close: number = 5000
  ) => {
    toastId.current = toast(message, {
      type,
      autoClose: close,
    });
  };

  const dismissalert = () => {
    if (toastId.current) {
      toast.dismiss(toastId.current);
    } else {
      console.warn("No active toast to dismiss");
    }
  };

  return { successalert, dismissalert };
}
