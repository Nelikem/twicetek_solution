import { z } from "zod"

/**
 * Unlike organization info, only `name` is required — a business card is a real
 * persisted row from the moment it's added (see businesses.service.ts), and fills
 * in over time. There's no single-row "completeness" gate the way Step 1 has one.
 */
export const businessSchema = z.object({
  logoPath: z.string().min(1).optional().nullable(),
  name: z.string().trim().min(2, "Enter a business name").max(200),
  legalName: z.string().trim().max(200).optional().or(z.literal("")),
  registrationNumber: z.string().trim().max(100).optional().or(z.literal("")),
  taxId: z.string().trim().max(100).optional().or(z.literal("")),
  industry: z.string().optional().or(z.literal("")),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  email: z.string().trim().email("Enter a valid email address").optional().or(z.literal("")),
  phone: z
    .string()
    .trim()
    .max(20)
    .regex(/^[+\d][\d\s()-]*$/, "Use digits, spaces, and +()- only")
    .optional()
    .or(z.literal("")),
  website: z.string().trim().url("Enter a valid URL, e.g. https://example.com").optional().or(z.literal("")),
  managerName: z.string().trim().max(200).optional().or(z.literal("")),
  address: z.string().trim().max(300).optional().or(z.literal("")),
})

export type BusinessValues = z.infer<typeof businessSchema>

/** Autosave payloads may touch any subset of fields as the user edits one at a time. */
export const businessDraftSchema = businessSchema.partial()
export type BusinessDraftValues = z.infer<typeof businessDraftSchema>

export const BUSINESS_DEFAULT_VALUES: BusinessDraftValues = {
  logoPath: null,
  name: "",
  legalName: "",
  registrationNumber: "",
  taxId: "",
  industry: "",
  description: "",
  email: "",
  phone: "",
  website: "",
  managerName: "",
  address: "",
}
