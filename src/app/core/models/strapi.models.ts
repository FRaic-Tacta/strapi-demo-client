import { environment } from '../../../environments/environment';

export interface StrapiPagination {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
}

export interface StrapiResponse<T> {
  data: T;
  meta: { pagination?: StrapiPagination };
}

export interface StrapiMedia {
  url: string;
  alternativeText: string | null;
  formats?: Record<string, { url: string }>;
}

export interface Author {
  id: number;
  documentId: string;
  name: string;
  bio: string | null;
  avatar: StrapiMedia | null;
}

export interface Category {
  id: number;
  documentId: string;
  name: string;
  slug: string;
}

export interface Article {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover: StrapiMedia | null;
  author: Author | null;
  categories: Category[];
  publishedAt: string | null;
}

export interface GlobalContent {
  id: number;
  documentId: string;
  siteName: string;
  tagline: string | null;
  heroText: string | null;
}

export interface Announcement {
  id: number;
  documentId: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  active: boolean;
}

export function mediaUrl(media: StrapiMedia | null | undefined, format?: string): string | null {
  if (!media) {
    return null;
  }
  const url = (format && media.formats?.[format]?.url) || media.url;
  return url.startsWith('http') ? url : `${environment.strapiUrl}${url}`;
}
