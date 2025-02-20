import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = "http://localhost:8080"

  constructor(private http: HttpClient, private router: Router) { }
  
  signup(formData: { firstName: string; lastName: string; email: string; password: string; imageUrl: any; phoneNumber: string; civilId: string; birthday: string; }) {
    return this.http.post(`${this.apiUrl}/volunteers`, formData)
      .subscribe((response) => {
        console.log('Signup successful', response)
        this.router.navigate(['/login']);
      },
      (error) => {
        console.log('Error', error)
      }
    )
  }
  
  orgsignup(formData: { name: string; website: string; email: string; password: string; imageUrl: any; phoneNumber: string; address: string; }) {
    return this.http.post(`${this.apiUrl}/organizations`, formData)
      .subscribe((response) => {
        console.log('Signup successful', response)
        this.router.navigate(['/login']);
      },
      (error) => {
        console.log('Error', error)
      }
    )
  }
  /**
   * Logs the user into the system.
   */
  login(credentials: { email: string, password: string }) {
    return this.http.post<{token: string}>(`${this.apiUrl}/login`, credentials)
      .subscribe((response) => {
        localStorage.setItem('authToken', response.token);
        this.router.navigate(['/']);
      })
  }  

  /**
   * Logs the user out of the system.
   */
  logout(): void {
    localStorage.removeItem('authToken');
    this.router.navigate(['/login']);
  }

  /**
   * Checks if user is authenticated.
   */
    isAuthenticated(): boolean { 
    const token = localStorage.getItem("authToken");
    return !!token;
  }
    
}
