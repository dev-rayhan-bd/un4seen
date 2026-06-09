import { z } from 'zod';

const createRideValidationSchema = z.object({
  bikeModel: z.string("Bike model is required").max(100),
  description: z.string("Description is required" ).max(500),
  rideType: z.string("Ride type is required"),
});

const voteRideValidationSchema = z.object({

    rating: z.number().min(0).max(10, "Rating must be between 0 and 10"),

});

export const RideValidations = {
  createRideValidationSchema,
  voteRideValidationSchema
};