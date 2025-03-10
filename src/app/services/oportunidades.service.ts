import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OportunidadesService {

  private apiUrl = "http://localhost:8080";

  constructor(private http:HttpClient) {
    this.getOportunities().subscribe(data => {
      console.log(data);
  });
  }

  public getOportunities(): Observable<any> {
      return this.http.get<{data: any}>(`${this.apiUrl}/offers`);
  }

  public getFilteredOpportunities(categoryId?: string, municipalityId?: string): Observable<any> {
    let url = `${this.apiUrl}/offers?`;
    
    if (categoryId) {
      url += `categoryId=${categoryId}`;
    }
    
    if (municipalityId) {
      url += categoryId ? `&municipalityId=${municipalityId}` : `municipalityId=${municipalityId}`;
    }
    
    return this.http.get<{data: any}>(url);
  }

  public getMunicipalities(): Observable<{data:any}> {
    return this.http.get<{data: any}>(`${this.apiUrl}/municipalities`);
  }

  public getCategories(): Observable<{data:any}> {
    return this.http.get<{data: any}>(`${this.apiUrl}/categories`);
  }

  public createOpportunity(formData: { title: string; address: string; description: string; categoryId: string; municipalityId: string; startDate: string | null; endDate: string | null; }) {
    return this.http.post(`${this.apiUrl}/offers`, formData)
  }

  public getOrgOpportunities(orgId: string){
    let opportunities = this.getOportunities();
    let orgOpportunities:any = []
    opportunities.forEach(opportunity => {
      if(opportunity.organization.id === orgId){
        orgOpportunities.push(opportunity)
      }
    })
    return orgOpportunities
  }
}
