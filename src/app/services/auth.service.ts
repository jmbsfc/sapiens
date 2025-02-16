import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = "http://localhost:8080/auth"

  constructor(private http: HttpClient, private router: Router) { }
  
  signup(formData: { firstname: string; lastname: string; role: string, email: string; password: string; profilePicture: any; phoneNumber: string; civilId: string; birthdate: string; }) {
    return this.http.post(`${this.apiUrl}/signup`, formData)
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
