import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Announcement, StrapiResponse } from '../models/strapi.models';

/**
 * The Announcement content type does not exist until it is created live
 * during the demo, so any error (403/404/network) is treated as "no
 * announcements" instead of surfacing a broken UI.
 */
@Injectable({ providedIn: 'root' })
export class AnnouncementService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.strapiUrl;

  getActive(): Observable<Announcement[]> {
    const params = new HttpParams().set('filters[active][$eq]', 'true');
    return this.http
      .get<StrapiResponse<Announcement[]>>(`${this.baseUrl}/api/announcements`, { params })
      .pipe(
        map((response) => response.data ?? []),
        catchError(() => of([]))
      );
  }
}
