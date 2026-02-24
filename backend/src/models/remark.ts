export interface Remark {
  id: number;
  tutorId: number;
  studentId: number;
  courseId: number;
  remarkText: string;
  createdAt: string;
}

export interface CreateRemarkPayload {
  studentId: number;
  courseId: number;
  remarkText: string;
}
