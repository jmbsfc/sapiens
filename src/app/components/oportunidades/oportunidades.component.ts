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
    this.isLoading = true;
    // Reset filter values
    this.selectedCategory = '';
    this.selectedMunicipality = '';
    
    this.oportunidadesService.getOportunities().subscribe(
      (data) => {
        console.log('Loaded opportunities:', data);
        this.data = data.data;
        this.originalData = [...data.data];
        this.isLoading = false;
      },
      (error) => {
        console.error('Error loading opportunities:', error);
        this.isLoading = false;
      }
    );
  }

  applyFilters() {
    console.log('Applying filters - Category:', this.selectedCategory, 'Municipality:', this.selectedMunicipality);
    this.isLoading = true;
    
    // Reset data to original if both filters are empty strings or null/undefined
    if ((!this.selectedCategory || this.selectedCategory === '') && 
        (!this.selectedMunicipality || this.selectedMunicipality === '')) {
      console.log('No filters selected, showing all opportunities');
      this.data = [...this.originalData];
      this.isLoading = false;
      return;
    }
    
    console.log('Calling getFilteredOpportunities with:', 
      this.selectedCategory || 'undefined', 
      this.selectedMunicipality || 'undefined'
    );
    
    // Call the service with the selected filters
    this.oportunidadesService.getFilteredOpportunities(
      this.selectedCategory || undefined, 
      this.selectedMunicipality || undefined
    ).subscribe(
      (response) => {
        console.log('API Response:', response);
        if (response && response.data) {
          console.log('Filtered opportunities data:', response.data);
          this.data = response.data;
        } else {
          console.warn('Response or response.data is undefined, using empty array');
          this.data = [];
        }
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
    console.log('Falling back to client-side filtering');
    let filteredData = [...this.originalData];
    
    if (this.selectedCategory && this.selectedCategory !== '') {
      console.log('Filtering by category:', this.selectedCategory);
      filteredData = filteredData.filter(item => item.category && item.category.id === this.selectedCategory);
    }
    
    if (this.selectedMunicipality && this.selectedMunicipality !== '') {
      console.log('Filtering by municipality:', this.selectedMunicipality);
      filteredData = filteredData.filter(item => item.municipality && item.municipality.id === this.selectedMunicipality);
    }
    
    console.log('Client-side filtered data:', filteredData);
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
