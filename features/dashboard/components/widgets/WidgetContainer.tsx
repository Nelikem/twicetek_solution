import type { LucideIcon } from "lucide-react"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface WidgetContainerProps {
  title: string
  icon?: LucideIcon
  action?: React.ReactNode
  isLoading?: boolean
  isError?: boolean
  isEmpty?: boolean
  emptyMessage?: string
  children: React.ReactNode
}

/**
 * The dashboard framework's one reusable widget primitive -- every widget
 * (present and future) wraps its own TanStack-Query-backed content in this,
 * rather than the framework knowing anything about what's inside.
 */
export function WidgetContainer({
  title,
  icon: Icon,
  action,
  isLoading,
  isError,
  isEmpty,
  emptyMessage = "Nothing here yet.",
  children,
}: WidgetContainerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {Icon && <Icon className="size-4 text-muted-foreground" />}
          {title}
        </CardTitle>
        {action && <CardAction>{action}</CardAction>}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : isError ? (
          <Alert variant="destructive">
            <AlertDescription>Something went wrong.</AlertDescription>
          </Alert>
        ) : isEmpty ? (
          <p className="py-4 text-center text-sm text-muted-foreground">{emptyMessage}</p>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}
