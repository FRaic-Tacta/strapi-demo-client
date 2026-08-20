import { TestBed, discardPeriodicTasks, fakeAsync, tick } from '@angular/core/testing';
import { of } from 'rxjs';

import { AnnouncementBannerComponent } from './announcement-banner.component';
import { AnnouncementService } from '../../core/services/announcement.service';
import { Announcement } from '../../core/models/strapi.models';

const ANNOUNCEMENT: Announcement = {
  id: 1,
  documentId: 'a1',
  title: 'Scheduled maintenance',
  message: 'The platform will be down tonight at 22:00.',
  severity: 'warning',
  active: true,
};

describe('AnnouncementBannerComponent', () => {
  let announcementService: jasmine.SpyObj<AnnouncementService>;

  beforeEach(async () => {
    announcementService = jasmine.createSpyObj<AnnouncementService>('AnnouncementService', ['getActive']);

    await TestBed.configureTestingModule({
      imports: [AnnouncementBannerComponent],
      providers: [{ provide: AnnouncementService, useValue: announcementService }],
    }).compileComponents();
  });

  it('renders nothing while there are no announcements', fakeAsync(() => {
    announcementService.getActive.and.returnValue(of([]));
    const fixture = TestBed.createComponent(AnnouncementBannerComponent);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.banner')).toBeNull();
    discardPeriodicTasks();
  }));

  it('shows active announcements with a severity class', fakeAsync(() => {
    announcementService.getActive.and.returnValue(of([ANNOUNCEMENT]));
    const fixture = TestBed.createComponent(AnnouncementBannerComponent);
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const banner = fixture.nativeElement.querySelector('.banner');
    expect(banner).toBeTruthy();
    expect(banner.classList).toContain('severity-warning');
    expect(banner.textContent).toContain('Scheduled maintenance');
    expect(banner.textContent).toContain('The platform will be down tonight at 22:00.');
    discardPeriodicTasks();
  }));
});
