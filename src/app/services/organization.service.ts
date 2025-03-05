import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  private apiUrl = "http://localhost:8080";

  organizationInfo: any = {
    name: "",
    website: "",
    email: "",
    imageUrl: "",
    phoneNumber: "",
    address: ""
  };

  constructor(private http: HttpClient, private router: Router) { }

  getProfileInfo(): Observable<{data: any}> {
    return this.http.get<{data: any}>(`${this.apiUrl}/organizations/me`);
  };

  getOrganizationInfo(): any {
    return this.organizationInfo;
  };

  setOrganizationInfo(): void {
    this.organizationInfo = this.getProfileInfo;
    this.organizationInfo.isOrgAccount = true;
  };

}