import { User } from "../types/auth";

/**
 * Calculates the total duration for installment payments.
 * Max duration is strictly capped at 3 months for all courses.
 */
export function calculateInstallmentPeriods(user: User | null, category: string): number {
  return 3; // Strictly capped at 3 months as per user request
}

/**
 * Returns available installment counts that fit within the 3-month cap.
 */
export const AVAILABLE_INSTALLMENT_COUNTS = [3, 4, 5, 6, 10, 12];
