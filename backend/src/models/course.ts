export interface Course {
  id: number;
  slug: string;
  title: string;
  description: string | null;
  price: number;
  thumbnailUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCoursePayload {
  slug?: string;
  title: string;
  description?: string;
  price: number;
  thumbnailUrl?: string;
}
