import { z } from "zod";

// Validation schemas for registration form

export const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  linkedinUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  ageAtEvent: z.number().min(13, "Must be at least 13 years old").max(120),
});

export const educationSchema = z.object({
  schoolId: z.string().min(1, "School is required"),
  levelOfStudy: z.string().min(1, "Level of study is required"),
  major: z.string().optional(),
  graduationYear: z.number().min(1900).max(2100).optional().nullable(),
});

export const dietarySchema = z.object({
  dietaryRestrictionIds: z.array(z.string()).optional(),
  allergyDetails: z.string().optional(),
});

export const shippingSchema = z.object({
  addressLine1: z.string().min(1, "Address is required"),
  addressLine2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  postalCode: z.string().min(1, "Postal code is required"),
  tshirtSize: z.string().min(1, "T-Shirt size is required"),
});

export const mlhSchema = z.object({
  agreedToCodeOfConduct: z.boolean().refine(val => val === true, {
    message: "You must agree to the MLH Code of Conduct",
  }),
  agreedToMlhSharing: z.boolean().refine(val => val === true, {
    message: "You must agree to MLH data sharing",
  }),
  agreedToMlhEmails: z.boolean(),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
export type EducationFormData = z.infer<typeof educationSchema>;
export type DietaryFormData = z.infer<typeof dietarySchema>;
export type ShippingFormData = z.infer<typeof shippingSchema>;
export type MlhFormData = z.infer<typeof mlhSchema>;

export type RegistrationFormData = ProfileFormData &
  EducationFormData &
  DietaryFormData &
  ShippingFormData &
  MlhFormData;
