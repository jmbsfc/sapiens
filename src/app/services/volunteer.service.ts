import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, tap, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VolunteerService {
  private apiUrl = "http://localhost:8080";

  volunteerInfo: any = {
    firstName: "",
    lastName: "",
    email: "",
    imageUrl: "",
    phoneNumber: "",
    civilId: "",
    birthday: ""
  };

  constructor(private http: HttpClient, private router: Router) { }

  getProfileInfo(): Observable<{data: any}> {
    console.log('Fetching volunteer profile from:', `${this.apiUrl}/auth/me`);
    return this.http.get<{data: any}>(`${this.apiUrl}/auth/me`)
      .pipe(
        tap(response => {
          console.log('Volunteer profile API response:', response);
        }),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    console.error('API Error:', error);
    if (error.status === 0) {
      console.error('Network error or server not running. Check if backend is available at: http://localhost:8080');
    } else {
      console.error(`Backend returned error code ${error.status}:`, error.error);
    }
    return throwError(() => error);
  }

  getVolunteerInfo(): any {
    return this.volunteerInfo;
  }

  setVolunteerInfo(): void {
    this.getProfileInfo().subscribe(
      (response) => {
        if (response && response.data) {
          this.volunteerInfo = response.data;
          this.volunteerInfo.isOrgAccount = false;
        }
      },
      (error) => {
        console.error('Error setting volunteer info:', error);
      }
    );
  }
}
