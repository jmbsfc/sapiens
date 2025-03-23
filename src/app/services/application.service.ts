import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

// Define an interface for the application object
interface Application {
  id: number;
  volunteer: {
    id: number;
    [key: string]: any;
  };
  [key: string]: any;
}

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
    console.log(`Getting applications for offer ${offerId}`);
    
    // Based on the backend controller, the correct endpoint is:
    // GET /applications/offers/{id}
    return this.http.get(`${this.apiUrl}/applications/offers/${offerId}`).pipe(
      map(response => {
        console.log(`Response from /applications/offers/${offerId}:`, response);
        return response;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error(`Error getting applications for offer ${offerId}:`, error);
        return of({ data: [] });
      })
    );
  }

  /**
   * Get all applications for the current volunteer
   * @returns Observable with the applications data
   */
  getMyApplications(): Observable<any> {
    console.log('Getting all applications for current volunteer');
    
    // Based on the backend controller, the correct endpoint is:
    // GET /applications/me
    return this.http.get(`${this.apiUrl}/applications/me`).pipe(
      map(response => {
        console.log('Response from /applications/me:', response);
        return response;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error getting applications for current volunteer:', error);
        return of({ data: [] });
      })
    );
  }

  /**
   * Apply to an opportunity
   * @param offerId The ID of the opportunity to apply to
   * @returns Observable with the created application data
   */
  applyToOffer(offerId: number): Observable<any> {
    // Log the request
    console.log(`Sending application request for opportunity ID: ${offerId}`);
    
    // Make the API call directly and handle errors
    // POST /applications/{id} is the correct endpoint
    return this.http.post(`${this.apiUrl}/applications/${offerId}`, {}).pipe(
      map(response => {
        console.log('Application API response:', response);
        return response;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error in applyToOffer:', error);
        
        // Check for specific error status codes
        if (error.status === 409 || error.status === 400 || error.status === 403) {
          // 409 Conflict, 400 Bad Request, or 403 Forbidden - User has already applied
          return throwError(() => new Error('Já se candidatou a esta oportunidade.'));
        }
        
        // For other errors, just pass them through
        return throwError(() => error);
      })
    );
  }

  /**
   * Check if the current user has already applied to an opportunity
   * @param offerId The ID of the opportunity
   * @param volunteerId The ID of the volunteer
   * @param applications The list of applications for the opportunity
   * @returns Boolean indicating if the user has already applied
   */
  hasUserApplied(offerId: number, volunteerId: number, applications: Application[]): boolean {
    if (!applications || applications.length === 0 || !volunteerId) {
      return false;
    }
    
    return applications.some((app: Application) => 
      app.volunteer && app.volunteer.id === volunteerId
    );
  }

  /**
   * Check if the current user has already applied to an opportunity directly from the server
   * @param offerId The ID of the opportunity
   * @returns Observable with boolean indicating if the user has already applied
   */
  checkUserApplication(offerId: number): Observable<boolean> {
    if (!offerId) {
      return of(false);
    }
    
    return this.getApplicationsForOffer(offerId).pipe(
      map(response => {
        if (!response || !response.data) {
          return false;
        }
        
        // We don't need to pass volunteerId here as the API should only return
        // applications for the current authenticated user
        const applications = response.data;
        return applications.some((app: Application) => app.volunteer && app.volunteer.id);
      }),
      catchError(() => {
        // In case of error, assume user hasn't applied
        return of(false);
      })
    );
  }

  /**
   * Directly check if a user has already applied to an opportunity
   * This uses the dedicated endpoint that returns 403 if user has applied
   * 
   * @param offerId The ID of the opportunity
   * @returns Observable with boolean indicating if the user has already applied
   */
  checkDirectApplicationStatus(offerId: number): Observable<boolean> {
    if (!offerId) {
      return of(false);
    }
    
    console.log(`Directly checking application status for opportunity ${offerId}`);
    
    // Using the correct endpoint: GET /applications/{id}/check
    // This returns 403 if user has applied, 200 if not
    return this.http.get(`${this.apiUrl}/applications/${offerId}/check`, { observe: 'response' })
      .pipe(
        map(response => {
          // If the request succeeds with 200 OK, the user has not applied
          console.log(`Direct check for opportunity ${offerId} returned:`, response.status);
          return false;
        }),
        catchError((error: HttpErrorResponse) => {
          console.log(`Direct check for opportunity ${offerId} returned error:`, error.status);
          
          // If the server returns 403 Forbidden, the user has already applied
          if (error.status === 403) {
            console.log(`User has already applied to opportunity ${offerId}`);
            return of(true);
          }
          
          // For other errors, assume the user has not applied
          return of(false);
        })
      );
  }

  /**
   * Cancel an application made by the volunteer
   * @param applicationId The ID of the application to cancel
   * @returns Observable with the response of the delete operation
   */
  cancelApplication(applicationId: number): Observable<any> {
    console.log(`Canceling application with ID: ${applicationId}`);
    
    return this.http.delete(`${this.apiUrl}/applications/${applicationId}`, { 
      observe: 'response',
      responseType: 'text' // Specify response type as text since it's a void API
    })
    .pipe(
      map(response => {
        console.log('Cancel application response:', response);
        return response;
      }),
      catchError((error: HttpErrorResponse) => {
        console.error('Error canceling application:', error);
        
        // If we get a 200 or 204 status with an error, it's actually a success
        if (error.status === 200 || error.status === 204) {
          console.log('Application successfully canceled despite error response');
          return of({ status: 'success' });
        }
        
        return throwError(() => error);
      })
    );
  }
} 