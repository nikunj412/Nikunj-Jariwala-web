import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GitHubService {
  private baseUrl = 'https://api.github.com/search/users';

  constructor(private http: HttpClient) {}

  searchUsers(query: string, page: number, perPage: number): Observable<any> {
    if (page <= 0 || perPage <= 0) {
      return new Observable((observer) => {
        observer.error(new Error('Invalid pagination values'));
      });
    }

    const encodedQuery = encodeURIComponent(query);
    const url = `${this.baseUrl}?q=${encodedQuery} in:login&page=${page}&per_page=${perPage}`;
    return this.http.get<any>(url).pipe(
      map((response) => ({
        total_count: response.total_count,
        items: response.items || [],
      }))
    );
  }
}
