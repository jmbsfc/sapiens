import { Component, OnInit } from '@angular/core';
import { CardComponent } from '../card/card.component';
import { OportunidadesService } from '../../services/oportunidades.service';
import { AuthService } from '../../services/auth.service';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VolunteerService } from '../../services/volunteer.service';
import { OrganizationService } from '../../services/organization.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-oportunidades',
  imports: [CardComponent, NgFor, NgIf, FormsModule],
  templateUrl: './oportunidades.component.html',
  styleUrl: './oportunidades.component.css',
  providers: [DatePipe]
})
export class OportunidadesComponent implements OnInit {
  data: any;
  municipalitiesData: any = [];
  selectedMunicipality: any = '';
  categoriesData: any = [];
  selectedCategory: any = '';
  isModalOpen = false;
  newOpportunity = {
    title: '',
    address: '',
    description: '',
    categoryId: '',
    municipalityId: '',
    startDate: null,
    endDate: null
  };
  profileInfo: any = {};
  isOrgAccount = false;

  constructor(
    private oportunidadesService: OportunidadesService,
    private authService: AuthService,
    private volunteerService: VolunteerService,
    private organizationService: OrganizationService,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.volunteerService.getProfileInfo().subscribe(
      (response) => {
        this.profileInfo = response.data;

        if (this.profileInfo.user.role === 'ORGANIZATION') {
          this.isOrgAccount = true;
        }
        this.oportunidadesService.getOportunities().subscribe((data) => {
          this.data = data.data;
        });
      },
      // (error) => {
      //   console.log('Error', error);
      //   this.organizationService.getProfileInfo().subscribe(
      //     (response) => {
      //       this.isOrgAccount = true;
      //       this.profileInfo = response.data;
      //       this.oportunidadesService.getOportunities().subscribe((data) => {
      //         this.data = data.data;
      //       });
      //     },
      //     (error) => {
      //       console.log('Error', error);
      //       this.oportunidadesService.getOportunities().subscribe((data) => {
      //         this.data = data.data;
      //       });
      //     }
      //   );
      // }
    );
    

    this.oportunidadesService.getMunicipalities().subscribe((data) => {
      this.municipalitiesData = data.data;
      console.log(data.data);
    });

    this.oportunidadesService.getCategories().subscribe((data) => {
      this.categoriesData = data.data;
      console.log(data.data);
    });

    console.log('isOrgAccount:', this.isOrgAccount);
    
  }

  onMunicipalityChange(event: Event) {
    this.selectedMunicipality = (event.target as HTMLSelectElement).value;
  }

  onCategoryChange(event: Event) {
    this.selectedCategory = (event.target as HTMLSelectElement).value;
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  onCreateOpportunity() {
    this.newOpportunity.startDate = this.datePipe.transform(this.newOpportunity.startDate, 'dd-MM-yyyy');
    this.newOpportunity.endDate = this.datePipe.transform(this.newOpportunity.endDate, 'dd-MM-yyyy');
    console.log('Creating opportunity:', this.newOpportunity);
    this.oportunidadesService.createOpportunity(this.newOpportunity).subscribe(
      (response) => {
        console.log('Opportunity created', response);
        this.closeModal();
      },
      (error) => {
        console.log('Error', error);
      }
    );
    this.closeModal();
  }
}
