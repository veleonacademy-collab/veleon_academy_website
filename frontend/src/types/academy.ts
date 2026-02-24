export interface Course {
  id: number;
  title: string;
  description: string | null;
  price: number;
  thumbnail_url: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  timetable_url?: string;
}

export interface Enrollment {
  id: number;
  studentId: number;
  courseId: number;
  status: 'enrolled' | 'completed' | 'dropped' | 'suspended';
  paymentPlan: 'one-time' | 'installment';
  totalPaid: number;
  nextPaymentDue: string | null;
  portalLocked: boolean;
  createdAt: string;
  updatedAt: string;
  course_title?: string;
  thumbnail_url?: string;
  timetable_url?: string;
  tutor_id?: number | null;
}

export interface ClassRecording {
  id: number;
  courseId: number;
  tutorId: number | null;
  title: string;
  videoUrl: string;
  recordingDate: string;
  createdAt: string;
}

export interface Assignment {
  id: number;
  courseId: number;
  tutorId: number | null;
  title: string;
  description: string | null;
  fileUrl: string | null;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}
