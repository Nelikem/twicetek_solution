export interface Session {
  id: string
  createdAt: string
  updatedAt: string | null
  refreshedAt: string | null
  expiresAt: string | null
  userAgent: string | null
  ip: string | null
  isCurrent: boolean
}
