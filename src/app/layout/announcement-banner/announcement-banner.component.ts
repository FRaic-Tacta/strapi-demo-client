import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { switchMap, timer } from 'rxjs';

import { AnnouncementService } from '../../core/services/announcement.service';
import { Announcement } from '../../core/models/strapi.models';

const POLL_INTERVAL_MS = 15_000;

/**
 * Polls for announcements so that the content type created live during the
 * demo shows up in the running app without a reload.
 */
@Component({
  selector: 'app-announcement-banner',
  imports: [],
  templateUrl: './announcement-banner.component.html',
  styleUrl: './announcement-banner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnnouncementBannerComponent {
  private readonly announcementService = inject(AnnouncementService);

  readonly announcements = toSignal(
    timer(0, POLL_INTERVAL_MS).pipe(switchMap(() => this.announcementService.getActive())),
    { initialValue: [] as Announcement[] }
  );
}
