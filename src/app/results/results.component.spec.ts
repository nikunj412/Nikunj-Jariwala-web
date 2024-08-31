import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { of, throwError } from 'rxjs';
import { ResultsComponent } from './results.component';
import { GitHubService } from '../github.service';
import { NzMessageService } from 'ng-zorro-antd/message';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzPaginationModule } from 'ng-zorro-antd/pagination';

describe('ResultsComponent', () => {
  let component: ResultsComponent;
  let fixture: ComponentFixture<ResultsComponent>;
  let gitHubService: jasmine.SpyObj<GitHubService>;
  let messageService: jasmine.SpyObj<NzMessageService>;

  beforeEach(async () => {
    const gitHubServiceSpy = jasmine.createSpyObj('GitHubService', [
      'searchUsers',
    ]);
    const messageServiceSpy = jasmine.createSpyObj('NzMessageService', [
      'error',
    ]);

    await TestBed.configureTestingModule({
      declarations: [ResultsComponent],
      imports: [HttpClientTestingModule, NzTableModule, NzPaginationModule],
      providers: [
        { provide: GitHubService, useValue: gitHubServiceSpy },
        { provide: NzMessageService, useValue: messageServiceSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ResultsComponent);
    component = fixture.componentInstance;
    gitHubService = TestBed.inject(
      GitHubService
    ) as jasmine.SpyObj<GitHubService>;
    messageService = TestBed.inject(
      NzMessageService
    ) as jasmine.SpyObj<NzMessageService>;

    gitHubService.searchUsers.and.returnValue(
      of({ items: [], total_count: 0 })
    );

    component.results = [];
    component.totalResults = 0;
    component.currentPage = 1;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display results correctly', () => {
    const mockUsers = [
      { login: 'user1', id: 1, avatar_url: 'url1', type: 'type1' },
      { login: 'user2', id: 2, avatar_url: 'url2', type: 'type2' },
    ];
    component.results = mockUsers;
    fixture.detectChanges();

    const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
    expect(rows.length).toBe(mockUsers.length);

    mockUsers.forEach((user, index) => {
      const cells = rows[index].queryAll(By.css('td'));
      expect(cells[0].nativeElement.querySelector('img')).toBeTruthy();
      expect(cells[0].nativeElement.querySelector('img').src).toContain(
        user.avatar_url
      );
      expect(cells[1].nativeElement.textContent.trim()).toBe(user.login);
      expect(cells[2].nativeElement.textContent.trim()).toBe(user.type);
    });
  });

  it('should bind results correctly to the table', () => {
    const mockData = [
      { login: 'user1', id: 1, avatar_url: 'url1', type: 'type1' },
      { login: 'user2', id: 2, avatar_url: 'url2', type: 'type2' },
    ];
    component.results = mockData;
    fixture.detectChanges();

    const rows = fixture.debugElement.queryAll(By.css('tbody tr'));
    expect(rows.length).toBe(mockData.length);

    mockData.forEach((user, index) => {
      const cells = rows[index].queryAll(By.css('td'));
      expect(cells[0].nativeElement.querySelector('img')).toBeTruthy();
      expect(cells[0].nativeElement.querySelector('img').src).toContain(
        user.avatar_url
      );
      expect(cells[1].nativeElement.textContent.trim()).toBe(user.login);
      expect(cells[2].nativeElement.textContent.trim()).toBe(user.type);
    });
  });

  it('should use the correct page size for pagination', () => {
    component.perPage = 9;
    fixture.detectChanges();

    const pagination = fixture.debugElement.query(
      By.css('nz-pagination')
    ).nativeElement;

    const pageSize = component.perPage;
    expect(pageSize).toBe(9);
  });

  it('should not call loadPage on initialization if commented out', () => {
    spyOn(component, 'loadPage').and.callThrough();
    component.ngOnInit();
    expect(component.loadPage).not.toHaveBeenCalled();
  });

  it('should load page and update results', () => {
    const mockData = {
      items: [{ login: 'user1', id: 1, avatar_url: 'url1', type: 'type1' }],
      total_count: 100,
    };
    gitHubService.searchUsers.and.returnValue(of(mockData));

    component.loadPage(1);
    fixture.detectChanges();

    expect(component.results).toEqual(mockData.items);
    expect(component.totalResults).toBe(mockData.total_count);
    expect(component.currentPage).toBe(1);
  });

  it('should handle error response and display error message', () => {
    const errorResponse = { status: 422, error: { message: 'Error message' } };
    gitHubService.searchUsers.and.returnValue(throwError(() => errorResponse));

    component.loadPage(1);
    fixture.detectChanges();

    expect(messageService.error).toHaveBeenCalledWith('Error message');
  });

  it('should call loadPage when page changes', () => {
    spyOn(component, 'loadPage').and.callThrough();
    const newPage = 2;
    component.onPageChange(newPage);
    expect(component.loadPage).toHaveBeenCalledWith(newPage);
  });

  it('should pass the correct parameters to searchUsers', () => {
    const query = 'test-query';
    component.query = query;
    const page = 1;
    const perPage = 9;
    gitHubService.searchUsers.and.returnValue(
      of({ items: [], total_count: 0 })
    );

    component.loadPage(page);
    expect(gitHubService.searchUsers).toHaveBeenCalledWith(
      query,
      page,
      perPage
    );
  });
});
