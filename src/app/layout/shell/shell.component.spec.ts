import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { ShellComponent } from './shell.component';
import { GlobalService } from '../../core/services/global.service';
import { AnnouncementService } from '../../core/services/announcement.service';

describe('ShellComponent', () => {
  beforeEach(async () => {
    const globalService = jasmine.createSpyObj<GlobalService>('GlobalService', ['getGlobal']);
    globalService.getGlobal.and.returnValue(
      of({ data: { id: 1, documentId: 'g1', siteName: 'Acme Engineering Blog', tagline: null, heroText: null }, meta: {} })
    );
    const announcementService = jasmine.createSpyObj<AnnouncementService>('AnnouncementService', ['getActive']);
    announcementService.getActive.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [ShellComponent],
      providers: [
        provideRouter([]),
        { provide: GlobalService, useValue: globalService },
        { provide: AnnouncementService, useValue: announcementService },
      ],
    }).compileComponents();
  });

  it('renders the site name from the Global single type and the nav links', () => {
    const fixture = TestBed.createComponent(ShellComponent);
    fixture.detectChanges();
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Acme Engineering Blog');
    expect(text).toContain('Articles');
    expect(text).toContain('About');
    expect(fixture.nativeElement.querySelector('router-outlet')).toBeTruthy();
  });
});
