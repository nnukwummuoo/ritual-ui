'use server';
import z from "zod";
import validations from "../formValidations/validateFormInputs"
import { SignupFormSchema } from "../formValidations/zodSignupSchema";
import axios from "axios"

export async function register(state: void, formData: FormData) {
    const result = validations(formData);

  if (!result.success) {
    console.error(result.errors);
    return {error: result.errors};
  }

    const signupData = result.validatedFields as z.infer<typeof SignupFormSchema>;
    const {confirmPassword, ...data} = signupData
     try {
    const response = await axios.post(process.env.NEXT_PUBLIC_API+"/register", data, {withCredentials: true});
    console.log({response})
    return {data: response.data};
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('Axios error:', error.response?.data);
    } else {
      console.error('Unexpected error:', error);
    }
    throw error;
  }
}
