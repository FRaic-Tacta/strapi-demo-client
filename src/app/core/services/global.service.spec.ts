import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { GlobalService } from './global.service';
import { environment } from '../../../environments/environment';
import { Author, GlobalContent, StrapiResponse } from '../models/strapi.models';

describe('GlobalService', () => {
  let service: GlobalService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(GlobalService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('requests the global single type', () => {
    let response: StrapiResponse<GlobalContent> | undefined;
    service.getGlobal().subscribe((r) => (response = r));

    const req = httpMock.expectOne(`${environment.strapiUrl}/api/global`);
    expect(req.request.method).toBe('GET');

    const body: StrapiResponse<GlobalContent> = {
      data: { id: 1, documentId: 'abc', siteName: 'Acme', tagline: 't', heroText: 'h' },
      meta: {},
    };
    req.flush(body);
    expect(response?.data.siteName).toBe('Acme');
  });

  it('requests authors with avatars', () => {
    let response: StrapiResponse<Author[]> | undefined;
    service.getAuthors().subscribe((r) => (response = r));

    const req = httpMock.expectOne(
      (r) =>
        r.url === `${environment.strapiUrl}/api/authors` &&
        r.params.get('populate[avatar]') === 'true' &&
        r.params.get('sort') === 'name:asc'
    );
    const body: StrapiResponse<Author[]> = { data: [], meta: {} };
    req.flush(body);
    expect(response).toEqual(body);
  });
});
