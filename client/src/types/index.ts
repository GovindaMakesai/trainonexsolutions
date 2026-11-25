export type Category = {
  _id: string;
  name: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
  projectCount?: number;
};

export type ImageAsset = {
  url: string;
  publicId: string;
};

export type Project = {
  _id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  thumbnail?: ImageAsset;
  gallery: ImageAsset[];
  category: Category | string;
  technologies: string[];
  projectUrl?: string;
  githubUrl?: string;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type ContactMessage = {
  _id: string;
  name: string;
  email: string;
  company?: string;
  budget?: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export type DashboardStats = {
  totalProjects: number;
  publishedProjects: number;
  draftProjects: number;
  categories: number;
  unreadMessages: number;
  recentProjects: Project[];
};

export type FieldError = {
  field: string;
  message: string;
};

export type ApiFailure = {
  message: string;
  errors?: FieldError[];
  status?: number;
};

export const BUDGET_OPTIONS = ['Under $10k', '$10k–$25k', '$25k–$50k', '$50k+', 'Not sure yet'] as const;
