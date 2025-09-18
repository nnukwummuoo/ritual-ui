import { z } from 'zod'
 
export const zodObj = {
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters long.' })
    .trim(),
  // email: z.string().email({ message: 'Please enter a valid email.' }).trim(),
  password:  z
    .string()
    .min(8, { message: 'Be at least 8 characters long' })
    .regex(/[a-zA-Z]/, { message: 'Contain at least one letter.' })
    .regex(/[0-9]/, { message: 'Contain at least one number.' })
    .trim(),
  dob: z
    .string()
    .trim(),
  gender: z
    .enum(['male', 'female'],
    { message: 'Gender must be either "male" or "female".' })
}

export const SignupFormSchema = z.object({
  firstname: zodObj.name,
  lastname: zodObj.name,
  username: zodObj.name,
  country: zodObj.name,
  //email: zodObj.email,
  password: zodObj.password,
  confirmPassword: zodObj.password,
  dob: zodObj.dob,
  gender: zodObj.gender,
})