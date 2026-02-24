export interface Course {
  id: number;
  title: string;
  description: string | null;
  price: number;
  thumbnailUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCoursePayload {
  title: string;
  description?: string;
  price: number;
  thumbnailUrl?: string;
}
