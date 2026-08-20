import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { ArticleService } from './article.service';
import { environment } from '../../../environments/environment';
import { Article, Category, StrapiResponse } from '../models/strapi.models';

describe('ArticleService', () => {
  let service: ArticleService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(ArticleService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('requests articles with population, pagination and sorting', () => {
    let response: StrapiResponse<Article[]> | undefined;
    service.getArticles(2).subscribe((r) => (response = r));

    const req = httpMock.expectOne(
      (r) =>
        r.url === `${environment.strapiUrl}/api/articles` &&
        r.params.get('populate[cover]') === 'true' &&
        r.params.get('populate[author][populate][avatar]') === 'true' &&
        r.params.get('populate[categories]') === 'true' &&
        r.params.get('pagination[page]') === '2' &&
        r.params.get('pagination[pageSize]') === '4' &&
        r.params.get('sort') === 'publishedAt:desc'
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.params.has('filters[categories][slug][$eq]')).toBeFalse();

    const body: StrapiResponse<Article[]> = {
      data: [],
      meta: { pagination: { page: 2, pageSize: 4, pageCount: 2, total: 5 } },
    };
    req.flush(body);
    expect(response).toEqual(body);
  });

  it('adds a category filter when a slug is given', () => {
    service.getArticles(1, 'engineering').subscribe();

    const req = httpMock.expectOne(
      (r) =>
        r.url === `${environment.strapiUrl}/api/articles` &&
        r.params.get('filters[categories][slug][$eq]') === 'engineering' &&
        r.params.get('pagination[page]') === '1'
    );
    req.flush({ data: [], meta: {} });
  });

  it('requests categories sorted by name', () => {
    let response: StrapiResponse<Category[]> | undefined;
    service.getCategories().subscribe((r) => (response = r));

    const req = httpMock.expectOne(
      (r) => r.url === `${environment.strapiUrl}/api/categories` && r.params.get('sort') === 'name:asc'
    );
    const body: StrapiResponse<Category[]> = { data: [], meta: {} };
    req.flush(body);
    expect(response).toEqual(body);
  });
});
