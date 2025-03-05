import { Component, OnInit } from '@angular/core';
import { VolunteerService } from '../../services/volunteer.service';
import { OrganizationService } from '../../services/organization.service';
import { OportunidadesService } from '../../services/oportunidades.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css',
})
export class PerfilComponent implements OnInit {
  profileInfo: any;
  isOrgAccount = false;
  orgOpportunities: any;

  constructor(
    private volunteerService: VolunteerService,
    private organizationService: OrganizationService,
    private oportunidadesService: OportunidadesService
  ) {}

  ngOnInit() {
    this.volunteerService.getProfileInfo().subscribe(
      (response) => {
        this.profileInfo = response.data;
        console.log(this.profileInfo);
        this.isOrgAccount = false;
      },
      (error) => {
        console.log('Error', error);
        this.organizationService.getProfileInfo().subscribe(
          (response) => {
            this.profileInfo = response.data;
            console.log(this.profileInfo);
            this.isOrgAccount = true;
            this.orgOpportunities = this.oportunidadesService.getOrgOpportunities(this.profileInfo.id)
          },
          (error) => {
            console.log('Error', error);
          }
        );
      }
    );


  }
}
