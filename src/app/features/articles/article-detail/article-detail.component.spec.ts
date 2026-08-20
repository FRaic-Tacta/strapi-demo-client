import { HttpHeaders } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Data, convertToParamMap, provideRouter } from '@angular/router';
import { ApolloTestingController, ApolloTestingModule } from 'apollo-angular/testing';
import { of } from 'rxjs';

import { ArticleDetailComponent } from './article-detail.component';
import { ARTICLE_BY_SLUG_QUERY, ArticleBySlugResult } from './article-detail.graphql';
import { PREVIEW_SECRET_HEADER } from '../../../core/models/preview.models';

const GRAPHQL_ARTICLE: ArticleBySlugResult['articles'][number] = {
  documentId: 'd1',
  title: 'Why We Went Headless',
  excerpt: 'Excerpt',
  content: 'First paragraph.\n\nSecond paragraph.',
  publishedAt: '2026-07-01T00:00:00.000Z',
  cover: { url: '/uploads/cover.png', alternativeText: 'Cover' },
  author: { name: 'Ana Kovac', bio: 'Frontend engineer', avatar: { url: '/uploads/ana.png', alternativeText: 'Ana' } },
  categories: [{ name: 'Engineering', slug: 'engineering' }],
  blocks: [
    { __typename: 'ComponentSharedQuote', text: 'Ship content, not deployments.', author: 'Iva Novak' },
    { __typename: 'ComponentSharedCodeBlock', code: 'npm run develop', language: 'bash' },
  ],
};

interface RouteStubOptions {
  readonly slug?: string;
  readonly queryParams?: Record<string, string>;
  readonly data?: Data;
}

function configureTestBed(options: RouteStubOptions = {}): void {
  TestBed.configureTestingModule({
    imports: [ArticleDetailComponent, ApolloTestingModule],
    providers: [
      provideRouter([]),
      {
        provide: ActivatedRoute,
        useValue: {
          paramMap: of(convertToParamMap({ slug: options.slug ?? 'why-we-went-headless' })),
          queryParamMap: of(convertToParamMap(options.queryParams ?? {})),
          data: of(options.data ?? {}),
        },
      },
    ],
  });
}

describe('ArticleDetailComponent', () => {
  let controller: ApolloTestingController;

  afterEach(() => controller?.verify());

  describe('public route', () => {
    beforeEach(() => {
      configureTestBed();
      controller = TestBed.inject(ApolloTestingController);
    });

    it('queries by the route slug and renders the article', () => {
      const fixture = TestBed.createComponent(ArticleDetailComponent);
      fixture.detectChanges();

      const operation = controller.expectOne(ARTICLE_BY_SLUG_QUERY);
      expect(operation.operation.variables['slug']).toBe('why-we-went-headless');

      operation.flush({ data: { articles: [GRAPHQL_ARTICLE] } });
      fixture.detectChanges();

      const text = fixture.nativeElement.textContent;
      expect(text).toContain('Why We Went Headless');
      expect(text).toContain('Ana Kovac');
      expect(text).toContain('First paragraph.');
      expect(text).toContain('Second paragraph.');
    });

    it('requests published content and sends no preview header', () => {
      const fixture = TestBed.createComponent(ArticleDetailComponent);
      fixture.detectChanges();

      const operation = controller.expectOne(ARTICLE_BY_SLUG_QUERY);
      expect(operation.operation.variables['status']).toBe('PUBLISHED');
      expect(operation.operation.getContext()['headers']).toBeUndefined();

      operation.flush({ data: { articles: [GRAPHQL_ARTICLE] } });
    });

    it('shows the back link instead of a preview banner', () => {
      const fixture = TestBed.createComponent(ArticleDetailComponent);
      fixture.detectChanges();

      controller.expectOne(ARTICLE_BY_SLUG_QUERY).flush({ data: { articles: [GRAPHQL_ARTICLE] } });
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.back-link')).toBeTruthy();
      expect(fixture.nativeElement.querySelector('.preview-banner')).toBeNull();
    });

    it('renders the dynamic zone blocks in order', () => {
      const fixture = TestBed.createComponent(ArticleDetailComponent);
      fixture.detectChanges();

      controller.expectOne(ARTICLE_BY_SLUG_QUERY).flush({ data: { articles: [GRAPHQL_ARTICLE] } });
      fixture.detectChanges();

      const quote = fixture.nativeElement.querySelector('blockquote.block-quote');
      expect(quote).toBeTruthy();
      expect(quote.textContent).toContain('Ship content, not deployments.');
      expect(quote.textContent).toContain('Iva Novak');

      const codeBlock = fixture.nativeElement.querySelector('.block-code');
      expect(codeBlock).toBeTruthy();
      expect(codeBlock.textContent).toContain('npm run develop');
      expect(codeBlock.textContent).toContain('bash');
    });

    it('shows a not-found message when no article matches', () => {
      const fixture = TestBed.createComponent(ArticleDetailComponent);
      fixture.detectChanges();

      const operation = controller.expectOne(ARTICLE_BY_SLUG_QUERY);
      operation.flush({ data: { articles: [] } });
      fixture.detectChanges();

      expect(fixture.nativeElement.textContent).toContain('Article not found');
    });
  });

  describe('preview route', () => {
    it('requests draft content and sends the preview secret header', () => {
      configureTestBed({
        slug: 'roadmap-2027',
        queryParams: { status: 'draft', secret: 'top-secret' },
        data: { preview: true },
      });
      controller = TestBed.inject(ApolloTestingController);

      const fixture = TestBed.createComponent(ArticleDetailComponent);
      fixture.detectChanges();

      const operation = controller.expectOne(ARTICLE_BY_SLUG_QUERY);
      expect(operation.operation.variables['slug']).toBe('roadmap-2027');
      expect(operation.operation.variables['status']).toBe('DRAFT');

      const headers = operation.operation.getContext()['headers'] as HttpHeaders;
      expect(headers.get(PREVIEW_SECRET_HEADER)).toBe('top-secret');

      operation.flush({ data: { articles: [{ ...GRAPHQL_ARTICLE, publishedAt: null }] } });
      fixture.detectChanges();

      const banner = fixture.nativeElement.querySelector('.preview-banner');
      expect(banner).toBeTruthy();
      expect(banner.textContent).toContain('Draft preview');
      expect(fixture.nativeElement.querySelector('.back-link')).toBeNull();
    });

    it('requests published content when the preview status says published', () => {
      configureTestBed({
        queryParams: { status: 'published', secret: 'top-secret' },
        data: { preview: true },
      });
      controller = TestBed.inject(ApolloTestingController);

      const fixture = TestBed.createComponent(ArticleDetailComponent);
      fixture.detectChanges();

      const operation = controller.expectOne(ARTICLE_BY_SLUG_QUERY);
      expect(operation.operation.variables['status']).toBe('PUBLISHED');

      operation.flush({ data: { articles: [GRAPHQL_ARTICLE] } });
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.preview-banner').textContent).toContain(
        'Published preview'
      );
    });

    it('warns and sends no header when the preview link has no secret', () => {
      configureTestBed({ queryParams: { status: 'draft' }, data: { preview: true } });
      controller = TestBed.inject(ApolloTestingController);

      const fixture = TestBed.createComponent(ArticleDetailComponent);
      fixture.detectChanges();

      const operation = controller.expectOne(ARTICLE_BY_SLUG_QUERY);
      expect(operation.operation.getContext()['headers']).toBeUndefined();

      operation.flush({ data: { articles: [GRAPHQL_ARTICLE] } });
      fixture.detectChanges();

      const banner = fixture.nativeElement.querySelector('.preview-banner.is-incomplete');
      expect(banner).toBeTruthy();
      expect(banner.textContent).toContain('missing its secret');
    });
  });
});
