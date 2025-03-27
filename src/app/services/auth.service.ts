import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = "http://localhost:8080"
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.isAuthenticated());
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) { }
  
  signup(
    formData: { 
      firstName: string; 
      lastName: string; 
      email: string; 
      password: string; 
      imageUrl: any; 
      phoneNumber: string; 
      civilId: string; 
      birthday: string; 
    },
    onSuccess?: () => void,
    onError?: (error: any) => void
  ) {
    return this.http.post(`${this.apiUrl}/volunteers`, formData)
      .subscribe(
        (response) => {
          console.log('Signup successful', response);
          if (onSuccess) {
            onSuccess();
          } else {
            this.router.navigate(['/login']);
          }
        },
        (error) => {
          console.log('Error', error);
          if (onError) {
            onError(error);
          }
        }
      );
  }
  
  orgsignup(
    formData: { 
      name: string; 
      website: string; 
      email: string; 
      password: string; 
      imageUrl: any; 
      phoneNumber: string; 
      address: string; 
    },
    onSuccess?: () => void,
    onError?: (error: any) => void
  ) {
    return this.http.post(`${this.apiUrl}/organizations`, formData)
      .subscribe(
        (response) => {
          console.log('Signup successful', response);
          if (onSuccess) {
            onSuccess();
          } else {
            this.router.navigate(['/login']);
          }
        },
        (error) => {
          console.log('Error', error);
          if (onError) {
            onError(error);
          }
        }
      );
  }
  
  /**
   * Logs the user into the system.
   */
  login(
    credentials: { email: string, password: string },
    onSuccess?: () => void,
    onError?: (error: any) => void
  ) {
    return this.http.post<{data: string}>(`${this.apiUrl}/auth`, credentials)
      .subscribe(
        (response) => {
          localStorage.setItem('authToken', response.data);
          console.log(response);
          this.isAuthenticatedSubject.next(true);
          if (onSuccess) {
            onSuccess();
          } else {
            this.router.navigate(['/']);
          }
        },
        (error) => {
          console.log('Error', error);
          if (onError) {
            onError(error);
          }
        }
      );
  }  

  /**
   * Logs the user out of the system.
   */
  logout(): void {
    localStorage.removeItem('authToken');
    this.isAuthenticatedSubject.next(false);
    this.router.navigate(['/login']);
  }

  /**
   * Checks if user is authenticated.
   */
  isAuthenticated(): boolean { 
    const token = localStorage.getItem("authToken");
    return !!token;
  }

  /**
   * Checks if the user is an organization account.
   */
  isOrgAccount(): any {
    const token = localStorage.getItem('authToken');
    return token && token.includes('organization');
  }
    
}
