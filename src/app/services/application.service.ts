import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private apiUrl = 'http://localhost:8080';

  constructor(private http: HttpClient) { }

  /**
   * Get all applications for a specific opportunity
   * @param offerId The ID of the opportunity
   * @returns Observable with the applications data
   */
  getApplicationsForOffer(offerId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/applications/${offerId}`);
  }

  /**
   * Apply to an opportunity
   * @param offerId The ID of the opportunity to apply to
   * @returns Observable with the created application data
   */
  applyToOffer(offerId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/applications/${offerId}`, {});
  }

  /**
   * Check if the current user has already applied to an opportunity
   * @param offerId The ID of the opportunity
   * @param volunteerId The ID of the volunteer
   * @param applications The list of applications for the opportunity
   * @returns Boolean indicating if the user has already applied
   */
  hasUserApplied(offerId: number, volunteerId: number, applications: any[]): boolean {
    if (!applications || applications.length === 0) {
      return false;
    }
    
    return applications.some(app => 
      app.volunteer && app.volunteer.id === volunteerId
    );
  }
} 