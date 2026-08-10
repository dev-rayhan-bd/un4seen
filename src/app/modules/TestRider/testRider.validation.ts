import z from "zod";

const testRiderValidationSchema = z.object({
  body: z.object({
    applicationText: z.string().min(20, "Please provide a more detailed application (min 20 chars)").max(2000),
    number: z.string().min(5, "Please provide a valid number"),
    age: z.number().min(1, "Please provide a valid age"),
    bikeType: z.string().min(2, "Please provide a bike type"),
  }),
});

export const TestRiderValidations = {
  testRiderValidationSchema,

};