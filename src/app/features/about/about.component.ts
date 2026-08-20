import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';

import { GlobalService } from '../../core/services/global.service';
import { Author, GlobalContent, StrapiMedia, mediaUrl } from '../../core/models/strapi.models';

@Component({
  selector: 'app-about',
  imports: [],
  templateUrl: './about.component.html',
  styleUrl: './about.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AboutComponent {
  private readonly globalService = inject(GlobalService);

  readonly global = toSignal(
    this.globalService.getGlobal().pipe(
      map((response) => response.data),
      catchError(() => of<GlobalContent | null>(null))
    ),
    { initialValue: null }
  );

  readonly authors = toSignal(
    this.globalService.getAuthors().pipe(
      map((response) => response.data),
      catchError(() => of<Author[]>([]))
    ),
    { initialValue: [] as Author[] }
  );

  avatarUrl(avatar: StrapiMedia | null): string | null {
    return mediaUrl(avatar, 'thumbnail');
  }
}
