import axios from "axios";
import { URL } from "./config"; // Assuming you have a config file with the base URL

/**
 * Defines the shape of the data required for user registration.
 */
interface RegistrationPayload {
  firstname: string;
  lastname: string;
  gender: string;
  nickname: string;
  password: string;
  age: string;
  country: string;
  dob: string;
  secretPhrase: string[];
}

/**
 * Sends a registration request to the backend API.
 * @param payload - The user registration data.
 * @returns The response data from the server.
 * @throws An error if the registration fails, returning the error message from the server.
 */
export const register = async (payload: RegistrationPayload) => {
  try {
    // The endpoint '/register' is assumed based on standard practices.
    // Please update it if your actual backend route is different.
    const res = await axios.post(`${URL}/registering`, payload);
    return res.data;
  } catch (error: any) {
    // Log the full error for debugging purposes
    console.error("Registration failed:", error);

    // Re-throw the error with a clear message to be caught by the component
    throw new Error(error?.response?.data?.message || "An unexpected error occurred during registration.");
  }
};
