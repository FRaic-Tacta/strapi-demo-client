import { Routes } from '@angular/router';

import { PREVIEW_ROUTE_FLAG } from './core/models/preview.models';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/articles/article-list/article-list.component').then(
        (m) => m.ArticleListComponent
      ),
  },
  {
    path: 'article/:slug',
    loadComponent: () =>
      import('./features/articles/article-detail/article-detail.component').then(
        (m) => m.ArticleDetailComponent
      ),
  },
  {
    // Loaded by the Strapi admin panel inside its Live Preview panel. Same
    // component as the public route, but it requests draft content.
    path: 'preview/article/:slug',
    data: { [PREVIEW_ROUTE_FLAG]: true },
    loadComponent: () =>
      import('./features/articles/article-detail/article-detail.component').then(
        (m) => m.ArticleDetailComponent
      ),
  },
  {
    path: 'about',
    loadComponent: () => import('./features/about/about.component').then((m) => m.AboutComponent),
  },
];
