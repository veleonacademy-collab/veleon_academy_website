export interface Enrollment {
  id: number;
  studentId: number;
  courseId: number;
  status: 'enrolled' | 'completed' | 'dropped' | 'suspended';
  paymentPlan: 'one-time' | 'installment';
  totalPaid: number;
  nextPaymentDue: string | null;
  portalLocked: boolean;
  tutorId: number | null;
  installmentsTotal: number;
  installmentsPaid: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEnrollmentPayload {
  studentId: number;
  courseId: number;
  paymentPlan: 'one-time' | 'installment';
  installmentsTotal?: number;
  installmentsPaid?: number;
  totalPaid?: number;
  nextPaymentDue?: string;
}
