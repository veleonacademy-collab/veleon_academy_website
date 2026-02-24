export interface Complaint {
  id: number;
  userId: number;
  courseId: number | null;
  subject: string;
  message: string;
  status: 'unresolved' | 'resolved';
  createdAt: string;
  updatedAt: string;
}

export interface CreateComplaintPayload {
  courseId?: number;
  subject: string;
  message: string;
}
