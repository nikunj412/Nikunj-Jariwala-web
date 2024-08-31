import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { GithubUser } from 'src/models/github-user.model';
import { SearchComponent } from './search/search.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { ResultsComponent } from './results/results.component';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        NzButtonModule,
        NzFormModule,
        NzInputModule,
        NzTableModule,
        NzPaginationModule,
      ],
      declarations: [AppComponent, SearchComponent, ResultsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    compiled = fixture.nativeElement as HTMLElement;
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should have initial state for results, totalResults, currentPage, and query', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.results).toEqual([]);
    expect(app.totalResults).toBe(0);
    expect(app.currentPage).toBe(1);
    expect(app.query).toBe('');
  });

  it('should render only the app-search component when no results are present', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const compiled = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
    expect(compiled.querySelector('.no-results app-search')).toBeTruthy();
    expect(compiled.querySelector('.with-results app-results')).toBeFalsy();
  });

  it('should render both app-search and app-results components when results are present', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    app.results = [
      { login: 'user1', id: 1, avatar_url: 'url1', type: 'type1' },
    ];
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.with-results app-search')).toBeTruthy();
    expect(compiled.querySelector('.with-results app-results')).toBeTruthy();
  });

  it('should update results on onSearchResult', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const mockResults: GithubUser[] = [
      { login: 'user1', id: 1, avatar_url: 'url1', type: 'type1' },
      { login: 'user2', id: 2, avatar_url: 'url2', type: 'type2' },
    ];
    app.onSearchResult(mockResults);
    expect(app.results).toEqual(mockResults);
  });

  it('should update query on onQuerySearch', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const mockQuery = 'angular';
    app.onQuerySearch(mockQuery);
    expect(app.query).toBe(mockQuery);
  });

  it('should update totalResults on onTotalResults', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const mockTotal = 100;
    app.onTotalResults(mockTotal);
    expect(app.totalResults).toBe(mockTotal);
  });

  it('should update currentPage on onPageChange', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    const mockPage = 2;
    app.onPageChange(mockPage);
    expect(app.currentPage).toBe(mockPage);
  });

  it('should pass the correct inputs to app-results', () => {
    const app = fixture.componentInstance;
    app.results = [
      { login: 'user1', id: 1, avatar_url: 'url1', type: 'type1' },
    ];
    app.query = 'angular';
    app.totalResults = 100;
    app.currentPage = 2;
    fixture.detectChanges();

    const resultsComponent = fixture.debugElement.query(
      By.directive(ResultsComponent)
    ).componentInstance as ResultsComponent;

    expect(resultsComponent.results).toEqual(app.results);
    expect(resultsComponent.query).toBe(app.query);
    expect(resultsComponent.totalResults).toBe(app.totalResults);
    expect(resultsComponent.currentPage).toBe(app.currentPage);
  });

  it('should have correct CSS classes based on results', () => {
    const app = fixture.componentInstance;

    app.results = [];
    fixture.detectChanges();
    expect(compiled.querySelector('.app-container.no-results')).toBeTruthy();
    expect(compiled.querySelector('.app-container.with-results')).toBeFalsy();

    app.results = [
      { login: 'user1', id: 1, avatar_url: 'url1', type: 'type1' },
    ];
    fixture.detectChanges();
    expect(compiled.querySelector('.app-container.no-results')).toBeFalsy();
    expect(compiled.querySelector('.app-container.with-results')).toBeTruthy();
  });
});
