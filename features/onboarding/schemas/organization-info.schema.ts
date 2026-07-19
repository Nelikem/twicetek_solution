import { z } from "zod"

/**
 * Full schema — gates the "Continue to Step 2" action once that step exists.
 * Field order matches the Step 1 spec: identity, contact, location, regional.
 */
export const organizationInfoSchema = z.object({
  logoPath: z.string().min(1).optional().nullable(),

  companyName: z.string().trim().min(2, "Enter your company name").max(200),
  legalBusinessName: z.string().trim().min(2, "Enter the legal business name").max(200),
  registrationNumber: z.string().trim().min(1, "Enter a business registration number").max(100),
  taxId: z.string().trim().min(1, "Enter a tax identification number").max(100),
  industry: z.string().min(1, "Select an industry"),

  orgEmail: z.string().trim().email("Enter a valid email address"),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(20, "Enter a valid phone number")
    .regex(/^[+\d][\d\s()-]*$/, "Use digits, spaces, and +()- only"),
  website: z
    .string()
    .trim()
    .url("Enter a valid URL, e.g. https://example.com")
    .optional()
    .or(z.literal("")),

  country: z.string().length(2, "Select a country"),
  state: z.string().trim().min(1, "Enter a state or region").max(100),
  city: z.string().trim().min(1, "Enter a city").max(100),
  address: z.string().trim().min(3, "Enter a business address").max(300),

  timezone: z.string().min(1, "Select a timezone"),
  currency: z.string().length(3, "Select a currency"),
  // Kept as a string (matching the <select> value) rather than z.coerce.number() —
  // the coercion happens once, at the service-layer DB boundary, so the form's
  // value type stays a plain string throughout and doesn't fight RHF's typing.
  fiscalYearStartMonth: z
    .string()
    .min(1, "Select a fiscal year start month")
    .refine((value) => {
      const n = Number(value)
      return Number.isInteger(n) && n >= 1 && n <= 12
    }, "Select a fiscal year start month"),
})

export type OrganizationInfoValues = z.infer<typeof organizationInfoSchema>

/** Drafts may be incomplete — every field is optional for autosave payloads. */
export const organizationInfoDraftSchema = organizationInfoSchema.partial()
export type OrganizationInfoDraftValues = z.infer<typeof organizationInfoDraftSchema>

export const ORGANIZATION_INFO_DEFAULT_VALUES: OrganizationInfoDraftValues = {
  logoPath: null,
  companyName: "",
  legalBusinessName: "",
  registrationNumber: "",
  taxId: "",
  industry: "",
  orgEmail: "",
  phone: "",
  website: "",
  country: "",
  state: "",
  city: "",
  address: "",
  timezone: "",
  currency: "",
  fiscalYearStartMonth: "",
}
