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
  originalData: any; // Store the original unfiltered data
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
  isLoading = false;

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
        this.loadOpportunities();
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
      console.log('Municipalities:', data.data);
    });

    this.oportunidadesService.getCategories().subscribe((data) => {
      this.categoriesData = data.data;
      console.log('Categories:', data.data);
    });

    console.log('isOrgAccount:', this.isOrgAccount);
  }

  loadOpportunities() {
    this.oportunidadesService.getOportunities().subscribe((data) => {
      this.data = data.data;
      this.originalData = [...data.data];
    });
  }

  onMunicipalityChange(event: Event) {
    this.selectedMunicipality = (event.target as HTMLSelectElement).value;
  }

  onCategoryChange(event: Event) {
    this.selectedCategory = (event.target as HTMLSelectElement).value;
  }

  applyFilters() {
    this.isLoading = true;
    
    if (!this.selectedCategory && !this.selectedMunicipality) {
      // If no filters are selected, show all opportunities
      this.data = this.originalData;
      this.isLoading = false;
      return;
    }
    
    this.oportunidadesService.getFilteredOpportunities(
      this.selectedCategory, 
      this.selectedMunicipality
    ).subscribe(
      (response) => {
        this.data = response.data;
        this.isLoading = false;
      },
      (error) => {
        console.error('Error filtering opportunities:', error);
        this.isLoading = false;
        // Fallback to client-side filtering if API filtering fails
        this.clientSideFiltering();
      }
    );
  }

  clientSideFiltering() {
    let filteredData = [...this.originalData];
    
    if (this.selectedCategory) {
      filteredData = filteredData.filter(item => item.category.id === this.selectedCategory);
    }
    
    if (this.selectedMunicipality) {
      filteredData = filteredData.filter(item => item.municipality.id === this.selectedMunicipality);
    }
    
    this.data = filteredData;
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
        // Reload opportunities after creating a new one
        this.loadOpportunities();
      },
      (error) => {
        console.log('Error', error);
      }
    );
    this.closeModal();
  }
}
