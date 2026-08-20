import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ArticleCardComponent } from '../article-card/article-card.component';
import { ArticleService } from '../../../core/services/article.service';
import { Article, Category } from '../../../core/models/strapi.models';

@Component({
  selector: 'app-article-list',
  imports: [ArticleCardComponent],
  templateUrl: './article-list.component.html',
  styleUrl: './article-list.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleListComponent {
  private readonly articleService = inject(ArticleService);
  private readonly destroyRef = inject(DestroyRef);

  readonly articles = signal<Article[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly page = signal(1);
  readonly pageCount = signal(1);
  readonly activeCategory = signal<string | undefined>(undefined);
  readonly loadFailed = signal(false);

  constructor() {
    this.loadArticles();
    this.loadCategories();
  }

  selectCategory(slug: string | undefined): void {
    this.activeCategory.set(slug);
    this.page.set(1);
    this.loadArticles();
  }

  goToPage(page: number): void {
    this.page.set(page);
    this.loadArticles();
  }

  private loadArticles(): void {
    this.articleService
      .getArticles(this.page(), this.activeCategory())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.articles.set(response.data);
          this.pageCount.set(response.meta.pagination?.pageCount ?? 1);
          this.loadFailed.set(false);
        },
        error: () => {
          this.articles.set([]);
          this.loadFailed.set(true);
        },
      });
  }

  private loadCategories(): void {
    this.articleService
      .getCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => this.categories.set(response.data),
        error: () => this.categories.set([]),
      });
  }
}
