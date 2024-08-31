import { Component } from '@angular/core';
import { GithubUser } from 'src/models/github-user.model';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  results: GithubUser[] = [];
  totalResults: number = 0;
  currentPage: number = 1;
  query: string = '';

  onSearchResult(users: GithubUser[]) {
    this.results = users;
    console.log('results', this.results);
  }

  onQuerySearch(query: string) {
    this.query = query;
  }

  onTotalResults(total: number) {
    this.totalResults = total;
  }

  onPageChange(page: any) {
    this.currentPage = page;
  }
}
