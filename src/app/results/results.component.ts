import { Component, Input, OnInit } from '@angular/core';
import { GitHubService } from '../github.service';
import { NzMessageService } from 'ng-zorro-antd/message';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
})
export class ResultsComponent implements OnInit {
  @Input() query: string = '';
  @Input() results: any[] = [];
  @Input() totalResults: number = 0;
  @Input() currentPage: number = 1;
  @Input() perPage: number = 9;

  constructor(
    private gitHubService: GitHubService,
    private message: NzMessageService
  ) {}

  ngOnInit(): void {}

  loadPage(page: number): void {
    this.gitHubService.searchUsers(this.query, page, this.perPage).subscribe(
      (data: any) => {
        this.results = data.items;
        this.totalResults = data.total_count;
        this.currentPage = page;
      },
      (e) => {
        if (e.status === 422) {
          this.message.error(e.error.message);
        }
      }
    );
  }

  onPageChange(page: number): void {
    this.loadPage(page);
  }
}
