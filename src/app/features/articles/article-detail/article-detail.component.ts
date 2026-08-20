import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Apollo } from 'apollo-angular';
import { catchError, combineLatest, map, of, shareReplay, switchMap } from 'rxjs';

import { ARTICLE_BY_SLUG_QUERY, ArticleBySlugResult, GraphqlArticle } from './article-detail.graphql';
import { mediaUrl } from '../../../core/models/strapi.models';
import {
  PreviewRequest,
  previewHeaders,
  resolvePreviewRequest,
  resolvePublicationStatus,
} from '../../../core/models/preview.models';
import { PreviewBannerComponent } from '../../../layout/preview-banner/preview-banner.component';

interface ArticleLoadState {
  article: GraphqlArticle | null;
  loaded: boolean;
}

interface ArticleRouteInputs {
  slug: string;
  preview: PreviewRequest | null;
}

/**
 * Renders a single article. Also serves the `/preview/article/:slug` route the
 * Strapi admin panel loads in its Live Preview panel, in which case it requests
 * draft content and shows a preview banner.
 */
@Component({
  selector: 'app-article-detail',
  imports: [DatePipe, RouterLink, PreviewBannerComponent],
  templateUrl: './article-detail.component.html',
  styleUrl: './article-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly apollo = inject(Apollo);

  private readonly routeInputs = combineLatest([
    this.route.paramMap,
    this.route.queryParamMap,
    this.route.data,
  ]).pipe(
    map(
      ([params, queryParams, routeData]): ArticleRouteInputs => ({
        slug: params.get('slug') ?? '',
        preview: resolvePreviewRequest(routeData, queryParams),
      })
    ),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly preview = toSignal(this.routeInputs.pipe(map((inputs) => inputs.preview)), {
    initialValue: null,
  });

  private readonly loadState = toSignal(
    this.routeInputs.pipe(
      switchMap(({ slug, preview }) =>
        this.apollo
          .watchQuery<ArticleBySlugResult>({
            query: ARTICLE_BY_SLUG_QUERY,
            variables: { slug, status: resolvePublicationStatus(preview) },
            // Previewed content changes on every editor save, so the cache must
            // not answer for it.
            fetchPolicy: preview ? 'network-only' : 'cache-first',
            context: { headers: previewHeaders(preview) },
          })
          .valueChanges.pipe(
            map(
              (result): ArticleLoadState => ({
                // Apollo types data as DeepPartial for partial cache results; the query always selects all fields
                article: (result.data?.articles?.[0] as GraphqlArticle | undefined) ?? null,
                loaded: true,
              })
            ),
            catchError(() => of<ArticleLoadState>({ article: null, loaded: true }))
          )
      )
    ),
    { initialValue: { article: null, loaded: false } as ArticleLoadState }
  );

  readonly article = computed(() => this.loadState().article);
  readonly loaded = computed(() => this.loadState().loaded);

  readonly isPreview = computed(() => this.preview() !== null);

  readonly coverUrl = computed(() => mediaUrl(this.article()?.cover ?? null));
  readonly avatarUrl = computed(() => mediaUrl(this.article()?.author?.avatar ?? null));

  readonly blocks = computed(() => this.article()?.blocks ?? []);

  readonly paragraphs = computed(() =>
    (this.article()?.content ?? '')
      .split(/\n\s*\n/)
      .map((paragraph) => paragraph.trim())
      .filter((paragraph) => paragraph.length > 0)
  );
}
