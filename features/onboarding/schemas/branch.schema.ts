import { z } from "zod"

/**
 * Like businesses, only `name` is required — a branch card is a real persisted
 * row from the moment it's added (see branches.service.ts), and fills in over
 * time.
 */
export const branchSchema = z.object({
  name: z.string().trim().min(2, "Enter a branch name").max(200),
  managerName: z.string().trim().max(200).optional().or(z.literal("")),
  email: z.string().trim().email("Enter a valid email address").optional().or(z.literal("")),
  phone: z
    .string()
    .trim()
    .max(20)
    .regex(/^[+\d][\d\s()-]*$/, "Use digits, spaces, and +()- only")
    .optional()
    .or(z.literal("")),
  gpsAddress: z.string().trim().max(200).optional().or(z.literal("")),
  physicalAddress: z.string().trim().max(300).optional().or(z.literal("")),
  openingHours: z.string().trim().max(300).optional().or(z.literal("")),
  warehouseEnabled: z.boolean(),
  posEnabled: z.boolean(),
  deliveryEnabled: z.boolean(),
})

export type BranchValues = z.infer<typeof branchSchema>

/** Autosave payloads may touch any subset of fields as the user edits one at a time. */
export const branchDraftSchema = branchSchema.partial()
export type BranchDraftValues = z.infer<typeof branchDraftSchema>

export const BRANCH_DEFAULT_VALUES: BranchDraftValues = {
  name: "",
  managerName: "",
  email: "",
  phone: "",
  gpsAddress: "",
  physicalAddress: "",
  openingHours: "",
  warehouseEnabled: false,
  posEnabled: false,
  deliveryEnabled: false,
}
