import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { GitHubService } from './github.service';

describe('GitHubService', () => {
  let service: GitHubService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [GitHubService],
    });

    service = TestBed.inject(GitHubService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch users successfully', () => {
    const mockResponse = {
      total_count: 1,
      items: [
        {
          avatar_url: 'http://example.com/avatar.png',
          login: 'testUser',
          type: 'User',
        },
      ],
    };

    service.searchUsers('testUser', 1, 9).subscribe((response) => {
      expect(response).toBeTruthy();
      expect(response.total_count).toBe(1);
      expect(response.items.length).toBe(1);
      expect(response.items[0].login).toBe('testUser');
    });

    const req = httpMock.expectOne(
      'https://api.github.com/search/users?q=testUser in:login&page=1&per_page=9'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should handle HTTP error responses', () => {
    const errorMessage = 'Error occurred';

    service.searchUsers('testUser', 1, 9).subscribe(
      () => fail('should have failed with 500 error'),
      (error) => {
        expect(error.status).toBe(500);
        expect(error.error).toContain(errorMessage);
      }
    );

    const req = httpMock.expectOne(
      'https://api.github.com/search/users?q=testUser in:login&page=1&per_page=9'
    );
    req.flush(errorMessage, { status: 500, statusText: 'Server Error' });
  });

  it('should call searchUsers with correct parameters', () => {
    const query = 'testUser';
    const page = 1;
    const perPage = 9;

    service.searchUsers(query, page, perPage).subscribe();

    const req = httpMock.expectOne(
      `https://api.github.com/search/users?q=${query} in:login&page=${page}&per_page=${perPage}`
    );
    expect(req.request.method).toBe('GET');
  });

  it('should handle empty responses gracefully', () => {
    const emptyResponse = {
      total_count: 0,
      items: [],
    };

    service.searchUsers('testUser', 1, 9).subscribe((response) => {
      expect(response).toBeTruthy();
      expect(response.total_count).toBe(0);
      expect(response.items.length).toBe(0);
    });

    const req = httpMock.expectOne(
      'https://api.github.com/search/users?q=testUser in:login&page=1&per_page=9'
    );
    req.flush(emptyResponse);
  });

  it('should encode special characters in query parameter', () => {
    const specialQuery = 'test@user';
    const encodedQuery = encodeURIComponent(specialQuery);

    const expectedUrl = `https://api.github.com/search/users?q=${encodedQuery} in:login&page=1&per_page=9`;

    service.searchUsers(specialQuery, 1, 9).subscribe();

    const req = httpMock.expectOne(expectedUrl);
    expect(req.request.method).toBe('GET');
    req.flush({ total_count: 1, items: [] });
  });

  it('should handle multiple pages correctly', () => {
    const mockResponse = {
      total_count: 20,
      items: [
        {
          avatar_url: 'http://example.com/avatar.png',
          login: 'userPage1',
          type: 'User',
        },
      ],
    };

    service.searchUsers('testUser', 2, 9).subscribe((response) => {
      expect(response).toBeTruthy();
      expect(response.total_count).toBe(20);
      expect(response.items.length).toBe(1);
    });

    const req = httpMock.expectOne(
      'https://api.github.com/search/users?q=testUser in:login&page=2&per_page=9'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should handle different perPage values correctly', () => {
    const mockResponse = {
      total_count: 15,
      items: [
        {
          avatar_url: 'http://example.com/avatar.png',
          login: 'userPerPage',
          type: 'User',
        },
      ],
    };

    service.searchUsers('testUser', 1, 15).subscribe((response) => {
      expect(response).toBeTruthy();
      expect(response.total_count).toBe(15);
      expect(response.items.length).toBe(1);
    });

    const req = httpMock.expectOne(
      'https://api.github.com/search/users?q=testUser in:login&page=1&per_page=15'
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should handle network errors gracefully', () => {
    service.searchUsers('testUser', 1, 9).subscribe(
      () => fail('should have failed with a network error'),
      (error) => {
        expect(error.status).toBe(0);
        expect(error.statusText).toBe('Unknown Error');
      }
    );

    const req = httpMock.expectOne(
      'https://api.github.com/search/users?q=testUser in:login&page=1&per_page=9'
    );
    req.error(new ErrorEvent('Network error'));
  });

  it('should handle unexpected API responses gracefully', () => {
    const unexpectedResponse = { unexpectedField: 'unexpectedValue' };

    service.searchUsers('testUser', 1, 9).subscribe((response) => {
      expect(response).toBeTruthy();
      expect(response.unexpectedField).toBeUndefined();
    });

    const req = httpMock.expectOne(
      'https://api.github.com/search/users?q=testUser in:login&page=1&per_page=9'
    );
    req.flush(unexpectedResponse);
  });

  it('should handle very long query strings', () => {
    const longQuery = 'a'.repeat(1000);
    const mockResponse = {
      total_count: 1,
      items: [
        {
          avatar_url: 'http://example.com/avatar.png',
          login: 'userLongQuery',
          type: 'User',
        },
      ],
    };

    service.searchUsers(longQuery, 1, 9).subscribe((response) => {
      expect(response).toBeTruthy();
      expect(response.total_count).toBe(1);
      expect(response.items.length).toBe(1);
    });

    const req = httpMock.expectOne(
      `https://api.github.com/search/users?q=${encodeURIComponent(
        longQuery
      )} in:login&page=1&per_page=9`
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should not fetch data with invalid pagination values', () => {
    const invalidPage = -1;
    const invalidPerPage = 0;

    service.searchUsers('testUser', invalidPage, invalidPerPage).subscribe(
      () => fail('should have failed with an error'),
      (error) => {
        expect(error.message).toContain('Invalid pagination values');
      }
    );

    httpMock.verify();
  });

  afterEach(() => {
    httpMock.verify();
  });
});
