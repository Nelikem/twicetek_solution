"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const RANGE_OPTIONS = [
  { value: "7", label: "Last 7 days" },
  { value: "30", label: "Last 30 days" },
  { value: "90", label: "Last 90 days" },
]

/**
 * Only two controls, both real: a date range and a business filter, both
 * affecting Recent Activity only (the sole real time-series data this
 * dashboard has). Category/Department/Payment Method controls from the
 * original spec are deliberately not rendered -- no backing dimension exists
 * for them, and a disabled control would be its own small dishonesty.
 */
export function DashboardFilterBar({ businesses }: { businesses: { id: string; name: string }[] }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function setParam(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    const query = params.toString()
    router.push(query ? `${pathname}?${query}` : pathname)
  }

  const range = searchParams.get("range") ?? "30"
  const business = searchParams.get("business") ?? "all"
  const businessLabels: Record<string, string> = { all: "All businesses", ...Object.fromEntries(businesses.map((b) => [b.id, b.name])) }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={range} onValueChange={(value) => setParam("range", value === "30" ? null : value)}>
        <SelectTrigger className="w-[160px]">
          {/* Base UI's SelectValue doesn't auto-resolve a SelectItem's label from its
              value -- without this children function it renders the raw value
              ("30") instead of the label ("Last 30 days"). */}
          <SelectValue placeholder="Date range">
            {(value: string) => RANGE_OPTIONS.find((option) => option.value === value)?.label ?? "Date range"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {RANGE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={business} onValueChange={(value) => setParam("business", value === "all" ? null : value)}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="All businesses">
            {(value: string) => businessLabels[value] ?? "All businesses"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All businesses</SelectItem>
          {businesses.map((b) => (
            <SelectItem key={b.id} value={b.id}>
              {b.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
