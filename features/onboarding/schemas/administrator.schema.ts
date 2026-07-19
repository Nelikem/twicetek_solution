import { z } from "zod"

/**
 * The signed-in org owner IS the Enterprise Administrator (no separate invite
 * flow) — this form edits their profile (fullName/phone) and their org-scoped
 * membership details (jobTitle) as one combined entity.
 */
export const administratorSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(200),
  jobTitle: z.string().trim().max(150).optional().or(z.literal("")),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(20, "Enter a valid phone number")
    .regex(/^[+\d][\d\s()-]*$/, "Use digits, spaces, and +()- only")
    .optional()
    .or(z.literal("")),
})

export type AdministratorValues = z.infer<typeof administratorSchema>

/** Autosave payloads may touch any subset of fields as the user edits one at a time. */
export const administratorDraftSchema = administratorSchema.partial()
export type AdministratorDraftValues = z.infer<typeof administratorDraftSchema>

export const ADMINISTRATOR_DEFAULT_VALUES: AdministratorDraftValues = {
  fullName: "",
  jobTitle: "",
  phone: "",
}
