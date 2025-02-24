import { Component, OnInit } from '@angular/core';
import { VolunteerService } from '../../services/volunteer.service';
import { OrganizationService } from '../../services/organization.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit {
  profileInfo: any;

  constructor(
    private volunteerService: VolunteerService,
    private organizationService: OrganizationService
  ) {}

  ngOnInit() {
    this.volunteerService.getProfileInfo().subscribe(
      (response) => {
        this.profileInfo = response.data;
        console.log(this.profileInfo);
      },
      (error) => {
        console.log('Error', error);
      }
    );
    this.organizationService.getProfileInfo().subscribe(
      (response) => {
        this.profileInfo = response.data;
        console.log(this.profileInfo);
      },
      (error) => {
        console.log('Error', error);
      }
    );
  }
}
