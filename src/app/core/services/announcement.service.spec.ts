import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { AnnouncementService } from './announcement.service';
import { environment } from '../../../environments/environment';
import { Announcement } from '../models/strapi.models';

describe('AnnouncementService', () => {
  let service: AnnouncementService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AnnouncementService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('returns active announcements', () => {
    let result: Announcement[] | undefined;
    service.getActive().subscribe((r) => (result = r));

    const req = httpMock.expectOne(
      (r) =>
        r.url === `${environment.strapiUrl}/api/announcements` &&
        r.params.get('filters[active][$eq]') === 'true'
    );
    const announcement: Announcement = {
      id: 1,
      documentId: 'a1',
      title: 'Maintenance',
      message: 'Tonight at 22:00',
      severity: 'warning',
      active: true,
    };
    req.flush({ data: [announcement], meta: {} });
    expect(result).toEqual([announcement]);
  });

  it('maps errors (content type does not exist yet) to an empty list', () => {
    let result: Announcement[] | undefined;
    service.getActive().subscribe((r) => (result = r));

    const req = httpMock.expectOne((r) => r.url === `${environment.strapiUrl}/api/announcements`);
    req.flush({ error: { status: 404 } }, { status: 404, statusText: 'Not Found' });
    expect(result).toEqual([]);
  });
});
