import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AboutComponent } from './about.component';
import { GlobalService } from '../../core/services/global.service';

describe('AboutComponent', () => {
  beforeEach(async () => {
    const globalService = jasmine.createSpyObj<GlobalService>('GlobalService', ['getGlobal', 'getAuthors']);
    globalService.getGlobal.and.returnValue(
      of({
        data: {
          id: 1,
          documentId: 'g1',
          siteName: 'Acme Engineering Blog',
          tagline: 'Notes from the team',
          heroText: 'Stories about engineering.',
        },
        meta: {},
      })
    );
    globalService.getAuthors.and.returnValue(
      of({
        data: [
          { id: 1, documentId: 'a1', name: 'Ana Kovac', bio: 'Frontend engineer', avatar: null },
          { id: 2, documentId: 'a2', name: 'Marko Horvat', bio: 'Backend engineer', avatar: null },
        ],
        meta: {},
      })
    );

    await TestBed.configureTestingModule({
      imports: [AboutComponent],
      providers: [{ provide: GlobalService, useValue: globalService }],
    }).compileComponents();
  });

  it('renders the global content and the authors', () => {
    const fixture = TestBed.createComponent(AboutComponent);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Acme Engineering Blog');
    expect(text).toContain('Notes from the team');
    expect(text).toContain('Stories about engineering.');
    expect(text).toContain('Ana Kovac');
    expect(text).toContain('Marko Horvat');
  });
});
