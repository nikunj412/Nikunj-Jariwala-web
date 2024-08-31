import { Component, EventEmitter, Output } from '@angular/core';
import { NgForm } from '@angular/forms';
import { GithubUser } from 'src/models/github-user.model';
import { GitHubService } from 'src/app/github.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css'],
})
export class SearchComponent {
  @Output() searchResult = new EventEmitter<GithubUser[]>();
  @Output() querySearch = new EventEmitter<string>();
  @Output() totalResults = new EventEmitter<number>();
  login: string = '';
  loading = false;
  isFormSubmitted = false;
  currentPage = 1;
  perPage = 9;

  constructor(private gitHubService: GitHubService) {}

  onSubmit(form: NgForm): void {
    this.isFormSubmitted = true;
    if (!this.isButtonEnabled(form)) {
      return;
    }

    this.loading = true;

    this.gitHubService
      .searchUsers(this.login, this.currentPage, this.perPage)
      .subscribe({
        next: (response) => {
          this.searchResult.emit(response.items);
          this.querySearch.emit(this.login);
          this.totalResults.emit(response.total_count);
          this.loading = false;
        },
        error: () => {
          this.searchResult.emit([]);
          this.loading = false;
        },
      });
  }

  isButtonEnabled(form: NgForm): boolean {
    return !form.invalid && this.login.trim().length > 0;
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.onSubmit({ invalid: false } as NgForm);
  }
}
