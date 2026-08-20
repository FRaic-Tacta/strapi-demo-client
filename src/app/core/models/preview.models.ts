import { HttpHeaders } from '@angular/common/http';
import type { Data } from '@angular/router';

/**
 * Live Preview support.
 *
 * The Strapi admin panel embeds the app in an iframe and appends a shared
 * secret plus the requested status to the preview URL. The secret is sent back
 * to Strapi as a header, which is what allows draft content to be read (see
 * `src/preview/draft-access.ts` in strapi-demo-cms).
 */

/** Must match PREVIEW_SECRET_HEADER on the Strapi side. */
export const PREVIEW_SECRET_HEADER = 'x-preview-secret';

/** Route data flag marking a route as a preview route. */
export const PREVIEW_ROUTE_FLAG = 'preview';

/** Strapi GraphQL PublicationStatus enum values. */
export type PublicationStatus = 'DRAFT' | 'PUBLISHED';

export interface PreviewRequest {
  readonly status: PublicationStatus;
  readonly secret: string | null;
}

/** Minimal read-only view of the query parameters this module needs. */
export interface QueryParamReader {
  get(name: string): string | null;
}

/**
 * Returns the preview request for a route, or null when the route is not a
 * preview route. A preview route without a secret still resolves, so the app
 * can render a clear "preview link is incomplete" state instead of silently
 * falling back to published content.
 */
export function resolvePreviewRequest(
  routeData: Data,
  queryParams: QueryParamReader
): PreviewRequest | null {
  if (routeData[PREVIEW_ROUTE_FLAG] !== true) {
    return null;
  }

  const requestedStatus = (queryParams.get('status') ?? 'draft').toLowerCase();

  return {
    status: requestedStatus === 'published' ? 'PUBLISHED' : 'DRAFT',
    secret: queryParams.get('secret'),
  };
}

/** The publication status a request should use, preview or not. */
export function resolvePublicationStatus(preview: PreviewRequest | null): PublicationStatus {
  return preview?.status ?? 'PUBLISHED';
}

/**
 * Headers to attach to a Strapi request. Only preview requests carrying a
 * secret get the header; everything else stays a plain public request.
 */
export function previewHeaders(preview: PreviewRequest | null): HttpHeaders | undefined {
  if (!preview?.secret) {
    return undefined;
  }

  return new HttpHeaders().set(PREVIEW_SECRET_HEADER, preview.secret);
}
