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

export interface Submission {
  id: number;
  assignmentId: number;
  studentId: number;
  fileUrl: string;
  grade: string | null;
  feedback: string | null;
  submittedAt: string;
}

export interface CreateAssignmentPayload {
  courseId: number;
  tutorId?: number;
  title: string;
  description?: string;
  fileUrl?: string;
  dueDate?: string;
}
