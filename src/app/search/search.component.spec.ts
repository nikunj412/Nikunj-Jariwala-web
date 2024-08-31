import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormsModule, NgForm } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { SearchComponent } from './search.component';
import { GitHubService } from 'src/app/github.service';
import { GithubUser } from 'src/models/github-user.model';
import { NzButtonModule } from 'ng-zorro-antd/button';

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;
  let gitHubService: jasmine.SpyObj<GitHubService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('GitHubService', ['searchUsers']);

    TestBed.configureTestingModule({
      imports: [FormsModule, NzButtonModule],
      declarations: [SearchComponent],
      providers: [{ provide: GitHubService, useValue: spy }],
    });

    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    gitHubService = TestBed.inject(
      GitHubService
    ) as jasmine.SpyObj<GitHubService>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form when username is empty', () => {
    component.login = '';
    fixture.detectChanges();
    const form = fixture.debugElement.query(By.css('form')).nativeElement;
    expect(form.checkValidity()).toBeFalse();
  });

  it('should disable submit button when form is invalid', () => {
    component.login = '';
    fixture.detectChanges();
    const submitButton = fixture.debugElement.query(
      By.css('button')
    ).nativeElement;
    expect(submitButton.disabled).toBeTrue();
  });

  it('should enable submit button when form is valid', () => {
    component.login = 'testuser';
    fixture.detectChanges();
    const submitButton = fixture.debugElement.query(
      By.css('button')
    ).nativeElement;
    expect(submitButton.disabled).toBeFalse();
  });

  it('should emit searchResult and querySearch on successful API call', () => {
    const mockUsers: GithubUser[] = [
      { login: 'user1', id: 1, avatar_url: 'url1', type: 'type1' },
    ];
    const mockTotalCount = 100;
    gitHubService.searchUsers.and.returnValue(
      of({ items: mockUsers, total_count: mockTotalCount })
    );

    spyOn(component.searchResult, 'emit');
    spyOn(component.querySearch, 'emit');
    spyOn(component.totalResults, 'emit');

    component.login = 'testuser';
    component.onSubmit({ invalid: false } as NgForm);

    expect(component.searchResult.emit).toHaveBeenCalledWith(mockUsers);
    expect(component.querySearch.emit).toHaveBeenCalledWith(component.login);
    expect(component.totalResults.emit).toHaveBeenCalledWith(mockTotalCount);
  });

  it('should emit empty array and hide loading spinner on failed API call', () => {
    gitHubService.searchUsers.and.returnValue(
      throwError(() => new Error('Error'))
    );

    spyOn(component.searchResult, 'emit');

    component.login = 'testuser';
    component.onSubmit({ invalid: false } as NgForm);

    expect(component.searchResult.emit).toHaveBeenCalledWith([]);
    expect(component.loading).toBeFalse();
  });

  it('should call onSubmit when page changes', () => {
    spyOn(component, 'onSubmit');

    component.onPageChange(2);

    expect(component.onSubmit).toHaveBeenCalledWith({
      invalid: false,
    } as NgForm);
  });
});
