import axios from "axios";
import { URL } from "../../api/config";

/**
 * Defines the shape of the data required for password reset.
 */
interface ForgetPasswordPayload {
  username: string;
  secretPhrase: string[];
  newPassword: string;
}

/**
 * Sends a password reset request to the backend API.
 * @param payload - The password reset data.
 * @returns The response data from the server.
 * @throws An error if the password reset fails, returning the error message from the server.
 */
export const forgetpass = async (payload: ForgetPasswordPayload) => {
  try {
    const res = await axios.post(`${URL}/forgetpassword`, payload, { withCredentials: true });
    return res.data;
  } catch (error: any) {
    // Log the full error for debugging purposes
    console.error("Password reset failed:", error);

    // Re-throw the error with a clear message to be caught by the component
    throw new Error(error?.response?.data?.message || "An unexpected error occurred during password reset.");
  }
};