import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OportunidadesService {

  private apiUrl = "http://localhost:8080";

  constructor(private http:HttpClient) { }

  public getOportunities(): Observable<any> {
      return this.http.get<{data: any}>(`${this.apiUrl}/offers`)
        .pipe(
          tap(response => console.log('All opportunities response:', response))
        );
  }

  public getOpportunity(id: number): Observable<any> {
    return this.http.get<{data: any}>(`${this.apiUrl}/offers/${id}`)
      .pipe(
        tap(response => console.log('Single opportunity response:', response))
      );
  }

  public getMunicipalities(): Observable<{data:any}> {
    return this.http.get<{data: any}>(`${this.apiUrl}/municipalities`)
      .pipe(
        tap(response => console.log('Municipalities response:', response))
      );
  }

  public getCategories(): Observable<{data:any}> {
    return this.http.get<{data: any}>(`${this.apiUrl}/categories`)
      .pipe(
        tap(response => console.log('Categories response:', response))
      );
  }

  public createOpportunity(formData: { title: string; address: string; description: string; categoryId: string; municipalityId: string; startDate: string | null; endDate: string | null; }) {
    return this.http.post(`${this.apiUrl}/offers`, formData)
      .pipe(
        tap(response => console.log('Create opportunity response:', response))
      );
  }

  public getOrgOpportunities(orgId: string): Observable<any> {
    return this.http.get<{data: any}>(`${this.apiUrl}/offers?organizationId=${orgId}`)
      .pipe(
        tap(response => console.log('Organization opportunities response:', response))
      );
  }

  public deleteOpportunity(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/offers/${id}`, { observe: 'response' })
      .pipe(
        tap(response => console.log('Delete opportunity response:', response))
      );
  }
}
