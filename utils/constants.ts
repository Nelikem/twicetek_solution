export interface SelectOption {
  value: string
  label: string
}

export const INDUSTRIES: readonly SelectOption[] = [
  { value: "agriculture", label: "Agriculture" },
  { value: "automotive", label: "Automotive" },
  { value: "construction", label: "Construction & Real Estate" },
  { value: "consulting", label: "Consulting & Professional Services" },
  { value: "education", label: "Education" },
  { value: "energy", label: "Energy & Utilities" },
  { value: "financial_services", label: "Financial Services" },
  { value: "food_beverage", label: "Food & Beverage" },
  { value: "healthcare", label: "Healthcare" },
  { value: "hospitality", label: "Hospitality & Tourism" },
  { value: "logistics", label: "Logistics & Transportation" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "media", label: "Media & Entertainment" },
  { value: "nonprofit", label: "Nonprofit" },
  { value: "retail", label: "Retail & E-commerce" },
  { value: "technology", label: "Technology & Software" },
  { value: "telecommunications", label: "Telecommunications" },
  { value: "other", label: "Other" },
] as const

// ISO 3166-1 alpha-2. A representative set covering major markets; expand as needed.
export const COUNTRIES: readonly SelectOption[] = [
  { value: "GH", label: "Ghana" },
  { value: "NG", label: "Nigeria" },
  { value: "KE", label: "Kenya" },
  { value: "ZA", label: "South Africa" },
  { value: "EG", label: "Egypt" },
  { value: "US", label: "United States" },
  { value: "CA", label: "Canada" },
  { value: "GB", label: "United Kingdom" },
  { value: "DE", label: "Germany" },
  { value: "FR", label: "France" },
  { value: "AE", label: "United Arab Emirates" },
  { value: "IN", label: "India" },
  { value: "SG", label: "Singapore" },
  { value: "AU", label: "Australia" },
] as const

// ISO 4217. A representative set; expand as needed.
export const CURRENCIES: readonly SelectOption[] = [
  { value: "GHS", label: "GHS — Ghanaian Cedi" },
  { value: "NGN", label: "NGN — Nigerian Naira" },
  { value: "KES", label: "KES — Kenyan Shilling" },
  { value: "ZAR", label: "ZAR — South African Rand" },
  { value: "USD", label: "USD — US Dollar" },
  { value: "EUR", label: "EUR — Euro" },
  { value: "GBP", label: "GBP — British Pound" },
  { value: "AED", label: "AED — UAE Dirham" },
  { value: "INR", label: "INR — Indian Rupee" },
] as const

const FALLBACK_TIMEZONES: readonly string[] = [
  "Africa/Accra",
  "Africa/Lagos",
  "Africa/Nairobi",
  "Africa/Johannesburg",
  "Africa/Cairo",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "America/New_York",
  "America/Los_Angeles",
  "America/Chicago",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Australia/Sydney",
  "UTC",
]

export const TIMEZONES: readonly SelectOption[] = (
  typeof Intl.supportedValuesOf === "function" ? Intl.supportedValuesOf("timeZone") : FALLBACK_TIMEZONES
).map((tz) => ({ value: tz, label: tz.replace(/_/g, " ") }))

export const FISCAL_YEAR_START_MONTHS: readonly SelectOption[] = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
] as const

export const ORGANIZATION_LOGO_MAX_BYTES = 2 * 1024 * 1024
export const ORGANIZATION_LOGO_ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"] as const
