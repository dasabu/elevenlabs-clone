import { z } from 'zod'

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required")
})

export const signUpSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters")
})

export type SignInFormValue = z.infer<typeof signInSchema>
export type SignUpFormValue = z.infer<typeof signUpSchema>