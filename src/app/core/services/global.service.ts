import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Author, GlobalContent, StrapiResponse } from '../models/strapi.models';

@Injectable({ providedIn: 'root' })
export class GlobalService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = environment.strapiUrl;

  getGlobal(): Observable<StrapiResponse<GlobalContent>> {
    return this.http.get<StrapiResponse<GlobalContent>>(`${this.baseUrl}/api/global`);
  }

  getAuthors(): Observable<StrapiResponse<Author[]>> {
    const params = new HttpParams().set('populate[avatar]', 'true').set('sort', 'name:asc');
    return this.http.get<StrapiResponse<Author[]>>(`${this.baseUrl}/api/authors`, { params });
  }
}
