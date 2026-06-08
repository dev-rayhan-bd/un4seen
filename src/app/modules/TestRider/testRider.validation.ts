import z from "zod";

const testRiderValidationSchema = z.object({
  body: z.object({
    applicationText: z.string().min(20, "Please provide a more detailed application (min 20 chars)").max(2000),
  }),
});

export const TestRiderValidations = {
  testRiderValidationSchema,

};