import axios from "axios";
import { URL } from "../../api/config";

/**
 * Defines the shape of the data required for changing a password.
 */
interface ChangePasswordPayload {
  id: string;
  password: string;
  isuser: boolean;
}

/**
 * Sends a password change request to the backend API.
 * @param payload - The password change data.
 * @returns The response data from the server.
 * @throws An error if the password change fails, returning the error message from the server.
 */
export const changePassword = async (payload: ChangePasswordPayload) => {
  try {
    const res = await axios.post(`${URL}/changepassword`, payload, { withCredentials: true });
    return res.data;
  } catch (error: any) {
    // Log the full error for debugging purposes
    console.error("Password change failed:", error);

    // Re-throw the error with a clear message to be caught by the component
    throw new Error(error?.response?.data?.message || "An unexpected error occurred during password change.");
  }
};