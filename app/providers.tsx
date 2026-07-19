"use client"

import { useState } from "react"
import { QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { Toaster } from "sonner"

import { TooltipProvider } from "@/components/ui/tooltip"
import { createQueryClient } from "@/lib/query-client"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(createQueryClient)

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        {children}
        <Toaster richColors position="top-right" closeButton />
      </TooltipProvider>
      {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  )
}
