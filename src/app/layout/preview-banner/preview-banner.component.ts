import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import type { PreviewRequest } from '../../core/models/preview.models';

/**
 * Makes it obvious that the page is a preview rather than the live site.
 * Presentational only: it takes the resolved preview request and renders.
 */
@Component({
  selector: 'app-preview-banner',
  imports: [],
  templateUrl: './preview-banner.component.html',
  styleUrl: './preview-banner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PreviewBannerComponent {
  readonly preview = input.required<PreviewRequest>();

  readonly isDraft = computed(() => this.preview().status === 'DRAFT');

  readonly hasSecret = computed(() => Boolean(this.preview().secret));

  readonly label = computed(() => (this.isDraft() ? 'Draft preview' : 'Published preview'));

  readonly message = computed(() => {
    if (!this.hasSecret()) {
      return 'This preview link is missing its secret, so only published content can be loaded.';
    }

    return this.isDraft()
      ? 'You are seeing unpublished content. Visitors of the live site cannot see this yet.'
      : 'You are seeing the published version of this document.';
  });
}
