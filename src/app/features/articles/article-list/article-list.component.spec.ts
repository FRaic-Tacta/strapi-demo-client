import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';

import { ArticleListComponent } from './article-list.component';
import { ArticleService } from '../../../core/services/article.service';
import { Article, Category, StrapiResponse } from '../../../core/models/strapi.models';

const CATEGORY: Category = { id: 1, documentId: 'c1', name: 'Engineering', slug: 'engineering' };

function article(id: number, title: string): Article {
  return {
    id,
    documentId: `d${id}`,
    title,
    slug: `slug-${id}`,
    excerpt: `Excerpt ${id}`,
    content: null,
    cover: null,
    author: { id: 1, documentId: 'a1', name: 'Ana Kovac', bio: null, avatar: null },
    categories: [CATEGORY],
    publishedAt: '2026-07-01T00:00:00.000Z',
  };
}

function response(articles: Article[], pageCount = 1): StrapiResponse<Article[]> {
  return { data: articles, meta: { pagination: { page: 1, pageSize: 4, pageCount, total: articles.length } } };
}

describe('ArticleListComponent', () => {
  let articleService: jasmine.SpyObj<ArticleService>;

  beforeEach(async () => {
    articleService = jasmine.createSpyObj<ArticleService>('ArticleService', ['getArticles', 'getCategories']);
    articleService.getArticles.and.returnValue(of(response([article(1, 'First'), article(2, 'Second')])));
    articleService.getCategories.and.returnValue(of({ data: [CATEGORY], meta: {} }));

    await TestBed.configureTestingModule({
      imports: [ArticleListComponent],
      providers: [provideRouter([]), { provide: ArticleService, useValue: articleService }],
    }).compileComponents();
  });

  function createFixture(): ComponentFixture<ArticleListComponent> {
    return TestBed.createComponent(ArticleListComponent);
  }

  it('renders a card per article', () => {
    const fixture = createFixture();
    fixture.detectChanges();
    const cards = fixture.nativeElement.querySelectorAll('app-article-card');
    expect(cards.length).toBe(2);
    expect(fixture.nativeElement.textContent).toContain('First');
    expect(fixture.nativeElement.textContent).toContain('Second');
  });

  it('shows an empty state when the API is unreachable', () => {
    articleService.getArticles.and.returnValue(throwError(() => new Error('down')));
    const fixture = createFixture();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No articles yet. Is Strapi running?');
  });

  it('reloads with the category slug when a filter is selected', () => {
    const fixture = createFixture();
    fixture.detectChanges();
    const filterButton: HTMLButtonElement = fixture.nativeElement.querySelector('button.category-filter');
    expect(filterButton.textContent).toContain('Engineering');

    filterButton.click();
    fixture.detectChanges();
    expect(articleService.getArticles).toHaveBeenCalledWith(1, 'engineering');
  });

  it('navigates pages with the pagination controls', () => {
    articleService.getArticles.and.returnValue(of(response([article(1, 'First')], 3)));
    const fixture = createFixture();
    fixture.detectChanges();

    const next: HTMLButtonElement = fixture.nativeElement.querySelector('button.page-next');
    next.click();
    fixture.detectChanges();
    expect(articleService.getArticles).toHaveBeenCalledWith(2, undefined);
  });
});
