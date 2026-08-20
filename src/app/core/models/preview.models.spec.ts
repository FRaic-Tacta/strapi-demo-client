import { convertToParamMap } from '@angular/router';

import {
  PREVIEW_SECRET_HEADER,
  previewHeaders,
  resolvePreviewRequest,
  resolvePublicationStatus,
} from './preview.models';

describe('preview.models', () => {
  describe('resolvePreviewRequest', () => {
    it('returns null for a route without the preview flag', () => {
      const request = resolvePreviewRequest({}, convertToParamMap({ secret: 'abc' }));

      expect(request).toBeNull();
    });

    it('defaults to draft when the status parameter is missing', () => {
      const request = resolvePreviewRequest({ preview: true }, convertToParamMap({ secret: 'abc' }));

      expect(request).toEqual({ status: 'DRAFT', secret: 'abc' });
    });

    it('maps the published status parameter case-insensitively', () => {
      const request = resolvePreviewRequest(
        { preview: true },
        convertToParamMap({ status: 'PUBLISHED', secret: 'abc' })
      );

      expect(request?.status).toBe('PUBLISHED');
    });

    it('resolves with a null secret so callers can report an incomplete link', () => {
      const request = resolvePreviewRequest({ preview: true }, convertToParamMap({}));

      expect(request).toEqual({ status: 'DRAFT', secret: null });
    });
  });

  describe('resolvePublicationStatus', () => {
    it('falls back to published outside preview', () => {
      expect(resolvePublicationStatus(null)).toBe('PUBLISHED');
    });

    it('uses the preview status in preview', () => {
      expect(resolvePublicationStatus({ status: 'DRAFT', secret: 'abc' })).toBe('DRAFT');
    });
  });

  describe('previewHeaders', () => {
    it('returns no headers outside preview', () => {
      expect(previewHeaders(null)).toBeUndefined();
    });

    it('returns no headers when the secret is missing', () => {
      expect(previewHeaders({ status: 'DRAFT', secret: null })).toBeUndefined();
    });

    it('sets the secret header when a secret is present', () => {
      const headers = previewHeaders({ status: 'DRAFT', secret: 'abc' });

      expect(headers?.get(PREVIEW_SECRET_HEADER)).toBe('abc');
    });
  });
});
