import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { catchError, map, of } from 'rxjs';

import { GlobalService } from '../../core/services/global.service';
import { AnnouncementBannerComponent } from '../announcement-banner/announcement-banner.component';

const FALLBACK_SITE_NAME = 'Strapi Demo Blog';

@Component({
  selector: 'app-shell',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, AnnouncementBannerComponent],
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShellComponent {
  private readonly globalService = inject(GlobalService);

  readonly siteName = toSignal(
    this.globalService.getGlobal().pipe(
      map((response) => response.data.siteName),
      catchError(() => of(FALLBACK_SITE_NAME))
    ),
    { initialValue: FALLBACK_SITE_NAME }
  );
}
