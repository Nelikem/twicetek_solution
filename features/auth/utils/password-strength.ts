export interface PasswordStrength {
  score: number // 0-5
  percent: number // 0-100, drives the Progress meter
  label: string
}

const LABELS = ["Very weak", "Weak", "Fair", "Good", "Strong", "Very strong"]

/** Mirrors passwordSchema's five rules one-for-one, so the meter always agrees
 * with what the validator will actually accept. */
export function getPasswordStrength(password: string): PasswordStrength {
  const checks = [
    password.length >= 12,
    /[a-z]/.test(password),
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^a-zA-Z0-9]/.test(password),
  ]
  const score = checks.filter(Boolean).length
  return { score, percent: (score / checks.length) * 100, label: LABELS[score] }
}
