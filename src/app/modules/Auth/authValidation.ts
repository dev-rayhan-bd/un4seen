import { z } from 'zod';

const loginValidationSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(6),
  }),
});

const setPasswordValidationSchema = z.object({
  body: z.object({
    password: z.string().min(8),
  }),
});

export const AuthValidation = {
  loginValidationSchema,
  setPasswordValidationSchema,
};