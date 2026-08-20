import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Article, Category, StrapiResponse } from '../models/strapi.models';

export const ARTICLES_PAGE_SIZE = 4;

@Injectable({ providedIn: 'root' })
export class ArticleService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.strapiUrl;

  getArticles(page: number, categorySlug?: string): Observable<StrapiResponse<Article[]>> {
    let params = new HttpParams()
      .set('populate[cover]', 'true')
      .set('populate[author][populate][avatar]', 'true')
      .set('populate[categories]', 'true')
      .set('pagination[page]', page)
      .set('pagination[pageSize]', ARTICLES_PAGE_SIZE)
      .set('sort', 'publishedAt:desc');
    if (categorySlug) {
      params = params.set('filters[categories][slug][$eq]', categorySlug);
    }
    return this.http.get<StrapiResponse<Article[]>>(`${this.baseUrl}/api/articles`, { params });
  }

  getCategories(): Observable<StrapiResponse<Category[]>> {
    const params = new HttpParams().set('sort', 'name:asc');
    return this.http.get<StrapiResponse<Category[]>>(`${this.baseUrl}/api/categories`, { params });
  }
}
