import { Component, OnInit, ViewChild } from '@angular/core';
import { CardComponent } from '../card/card.component';
import { OportunidadesService } from '../../services/oportunidades.service';
import { AuthService } from '../../services/auth.service';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
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
  @ViewChild('opportunityForm') opportunityForm!: NgForm;
  
  data: any;
  originalData: any = []; // Store the original unfiltered data
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
    startDate: '',
    endDate: ''
  };
  profileInfo: any = {};
  isOrgAccount = false;
  isLoading = false;
  formSubmitted = false;

  // Validation messages
  validationMessages = {
    title: {
      required: 'O título é obrigatório.',
      minlength: 'O título deve ter pelo menos 5 caracteres.'
    },
    category: {
      required: 'A categoria é obrigatória.'
    },
    municipality: {
      required: 'O município é obrigatório.'
    },
    address: {
      required: 'O endereço é obrigatório.',
      minlength: 'O endereço deve ter pelo menos 5 caracteres.'
    },
    description: {
      required: 'A descrição é obrigatória.',
      minlength: 'A descrição deve ter pelo menos 20 caracteres.'
    },
    startDate: {
      required: 'A data de início é obrigatória.'
    },
    endDate: {
      required: 'A data de término é obrigatória.'
    }
  };

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
    this.oportunidadesService.getOportunities()
    .subscribe(
      (response) => {
        if (response && response.data) {
          this.data = response.data;
          this.clientSideFiltering(response.data);
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
        this.clientSideFiltering(this.originalData);
      }
    );
  }

  clientSideFiltering(originalData: any) {
    console.log('Falling back to client-side filtering');
    let filteredData = [...originalData];
    
    if (this.selectedCategory && this.selectedCategory !== '') {
      console.log('Filtering by category:', this.selectedCategory);
      filteredData = filteredData.filter(item => item.category && item.category.id == this.selectedCategory);
    }
    
    if (this.selectedMunicipality && this.selectedMunicipality !== '') {
      console.log('Filtering by municipality:', this.selectedMunicipality);
      filteredData = filteredData.filter(item => item.municipality && item.municipality.id == this.selectedMunicipality);
    }
    
    console.log('Client-side filtered data:', filteredData);
    this.data = filteredData;
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
    this.resetForm();
  }

  onCreateOpportunity() {
    this.formSubmitted = true;

    if (this.opportunityForm.invalid) {
      console.log('Form is invalid:', this.opportunityForm.errors);
      return;
    }

    // Validate dates
    const startDate = new Date(this.newOpportunity.startDate);
    const endDate = new Date(this.newOpportunity.endDate);
    const today = new Date();

    if (startDate < today) {
      console.error('A data de início não pode ser anterior à data atual');
      return;
    }

    if (endDate <= startDate) {
      console.error('A data de término deve ser posterior à data de início');
      return;
    }

    const formattedStartDate = this.datePipe.transform(startDate, 'dd-MM-yyyy') || '';
    const formattedEndDate = this.datePipe.transform(endDate, 'dd-MM-yyyy') || '';
    
    const opportunityData = {
      ...this.newOpportunity,
      startDate: formattedStartDate,
      endDate: formattedEndDate
    };
    
    console.log('Creating opportunity:', opportunityData);
    this.oportunidadesService.createOpportunity(opportunityData).subscribe(
      (response) => {
        console.log('Opportunity created', response);
        this.resetForm();
        this.closeModal();
        this.loadOpportunities();
      },
      (error) => {
        console.error('Error creating opportunity:', error);
      }
    );
  }

  resetForm() {
    this.formSubmitted = false;
    this.newOpportunity = {
      title: '',
      address: '',
      description: '',
      categoryId: '',
      municipalityId: '',
      startDate: '',
      endDate: ''
    };
    if (this.opportunityForm) {
      this.opportunityForm.resetForm();
    }
  }

  // Helper method to check if a field has errors
  hasError(field: string): boolean {
    const control = this.opportunityForm?.form.get(field);
    return this.formSubmitted && control ? (control.invalid && (control.dirty || control.touched)) : false;
  }

  // Helper method to get error message
  getErrorMessage(field: string): string {
    const control = this.opportunityForm?.form.get(field);
    if (control && control.errors) {
      const messages = this.validationMessages[field as keyof typeof this.validationMessages];
      for (const key in control.errors) {
        if (messages[key as keyof typeof messages]) {
          return messages[key as keyof typeof messages];
        }
      }
    }
    return '';
  }
}
