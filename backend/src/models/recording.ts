export interface ClassRecording {
  id: number;
  courseId: number;
  tutorId: number | null;
  title: string;
  videoUrl: string;
  recordingDate: string;
  createdAt: string;
}

export interface CreateRecordingPayload {
  courseId: number;
  tutorId?: number;
  title: string;
  videoUrl: string;
  recordingDate?: string;
}
