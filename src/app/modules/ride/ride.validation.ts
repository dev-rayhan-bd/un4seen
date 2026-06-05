import { z } from 'zod';

const createRideValidationSchema = z.object({

    bikeModel: z.string( "Bike model is required" ).max(100),
    description: z.string("Description is required").max(500),
    rideType: z.string("Ride type is required"),

});

export const RideValidations = {
  createRideValidationSchema,
};