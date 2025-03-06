import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

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
    return this.http.get<{data: any}>(`${this.apiUrl}/auth/me`);
  }

  getVolunteerInfo(): any {
    return this.volunteerInfo;
  };

  setVolunteerInfo(): void {
    this.volunteerInfo = this.getProfileInfo;
    this.volunteerInfo.isOrgAccount = false;
  };
}
