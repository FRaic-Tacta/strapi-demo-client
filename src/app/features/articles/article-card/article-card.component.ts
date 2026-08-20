import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Article, mediaUrl } from '../../../core/models/strapi.models';

@Component({
  selector: 'app-article-card',
  imports: [DatePipe, RouterLink],
  templateUrl: './article-card.component.html',
  styleUrl: './article-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArticleCardComponent {
  readonly article = input.required<Article>();

  readonly coverUrl = computed(() => mediaUrl(this.article().cover, 'small'));
}
