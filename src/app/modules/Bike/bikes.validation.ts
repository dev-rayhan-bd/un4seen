import { z } from 'zod';

const createBikeValidationSchema = z.object({

  year: z.string( "Year is required" ),
  make: z.string("Make is required" ),
  model: z.string( "Model is required" ),
  bikeType: z.string( "Bike type is required" ),
  color: z.string( "Color is required" ),
  

  upgrades: z.array(
    z.object({
      title: z.string("Section title is required"),
      items: z.array(z.string()).optional()
    })
  ).optional()
});

export const BikeValidations = { createBikeValidationSchema };