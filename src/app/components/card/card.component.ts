import { NgIf } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ApplicationService } from '../../services/application.service';
import { VolunteerService } from '../../services/volunteer.service';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [NgIf, DatePipe],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css'],
  providers: [DatePipe]
})
export class CardComponent implements OnInit {
  @Input() cardData: any = {};
  @Input() profileInfo: any = {}
  @Input() isOrgAccount: any
  isModalOpen = false;
  isMine = false;
  formattedStartDate: string = '';
  formattedEndDate: string = '';
  
  // Application related properties
  applications: any[] = [];
  hasApplied: boolean = false;
  isApplying: boolean = false;
  applicationError: string | null = null;

  constructor(
    private datePipe: DatePipe,
    private applicationService: ApplicationService,
    private volunteerService: VolunteerService
  ) {}

  ngOnInit() {
    console.log('HERE--------------------------',this.isOrgAccount, this.cardData.organization?.id)
    if(this.isOrgAccount) {
      this.isMine = this.cardData.organization?.id === this.profileInfo.id
    }
    
    // Format dates
    this.formatDates();
    
    // Load applications for this opportunity
    this.loadApplications();
  }

  formatDates() {
    try {
      // Check if dates exist and try to format them
      if (this.cardData && this.cardData.startDate) {
        // Try to parse the date string using multiple approaches
        let startDate: Date | null = null;
        
        if (typeof this.cardData.startDate === 'string') {
          // Try different date parsing approaches
          // First try direct parsing
          startDate = new Date(this.cardData.startDate);
          
          // If invalid, try replacing hyphens with slashes
          if (isNaN(startDate.getTime())) {
            startDate = new Date(this.cardData.startDate.replace(/-/g, '/'));
          }
          
          // If still invalid, try parsing DD-MM-YYYY format
          if (isNaN(startDate.getTime()) && this.cardData.startDate.includes('-')) {
            const parts = this.cardData.startDate.split('-');
            if (parts.length === 3) {
              // Assuming DD-MM-YYYY format
              startDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
            }
          }
        } else {
          startDate = this.cardData.startDate;
        }
        
        // Only format if we have a valid date
        if (startDate && !isNaN(startDate.getTime())) {
          this.formattedStartDate = this.datePipe.transform(startDate, 'dd/MM/yyyy') || '';
        } else {
          console.warn('Invalid start date:', this.cardData.startDate);
          this.formattedStartDate = 'Data não disponível';
        }
      }
      
      if (this.cardData && this.cardData.endDate) {
        // Try to parse the date string using multiple approaches
        let endDate: Date | null = null;
        
        if (typeof this.cardData.endDate === 'string') {
          // Try different date parsing approaches
          // First try direct parsing
          endDate = new Date(this.cardData.endDate);
          
          // If invalid, try replacing hyphens with slashes
          if (isNaN(endDate.getTime())) {
            endDate = new Date(this.cardData.endDate.replace(/-/g, '/'));
          }
          
          // If still invalid, try parsing DD-MM-YYYY format
          if (isNaN(endDate.getTime()) && this.cardData.endDate.includes('-')) {
            const parts = this.cardData.endDate.split('-');
            if (parts.length === 3) {
              // Assuming DD-MM-YYYY format
              endDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
            }
          }
        } else {
          endDate = this.cardData.endDate;
        }
        
        // Only format if we have a valid date
        if (endDate && !isNaN(endDate.getTime())) {
          this.formattedEndDate = this.datePipe.transform(endDate, 'dd/MM/yyyy') || '';
        } else {
          console.warn('Invalid end date:', this.cardData.endDate);
          this.formattedEndDate = 'Data não disponível';
        }
      }
    } catch (error) {
      console.error('Error formatting dates:', error);
      // Fallback to default values if formatting fails
      this.formattedStartDate = 'Data não disponível';
      this.formattedEndDate = 'Data não disponível';
    }
    
    console.log('Formatted dates:', this.formattedStartDate, this.formattedEndDate);
  }

  openModal() {
    this.isModalOpen = true;
    // Prevent scrolling of the background when modal is open
    document.body.style.overflow = 'hidden';
    
    // Refresh applications when opening the modal
    this.loadApplications();
  }

  closeModal() {
    this.isModalOpen = false;
    // Re-enable scrolling when modal is closed
    document.body.style.overflow = 'auto';
  }

  /**
   * Load applications for this opportunity
   */
  loadApplications() {
    if (!this.cardData || !this.cardData.id) {
      console.warn('No opportunity ID available to load applications');
      return;
    }
    
    this.applicationService.getApplicationsForOffer(this.cardData.id).subscribe(
      (response) => {
        console.log('Applications response:', response);
        if (response && response.data) {
          this.applications = response.data;
          
          // Check if the current user has already applied
          if (this.profileInfo && this.profileInfo.id) {
            this.hasApplied = this.applicationService.hasUserApplied(
              this.cardData.id, 
              this.profileInfo.id, 
              this.applications
            );
            console.log('User has applied:', this.hasApplied);
          }
        } else {
          this.applications = [];
          this.hasApplied = false;
        }
      },
      (error) => {
        console.error('Error loading applications:', error);
        this.applications = [];
        this.hasApplied = false;
      }
    );
  }

  /**
   * Apply for the current opportunity
   */
  applyForOpportunity() {
    if (this.isApplying) {
      return; // Prevent multiple submissions
    }
    
    // Check if user is logged in
    if (!this.profileInfo || !this.profileInfo.id) {
      this.applicationError = 'Precisa de iniciar sessão para se candidatar.';
      return;
    }
    
    // Check if user has already applied
    if (this.hasApplied) {
      this.applicationError = 'Já se candidatou a esta oportunidade.';
      return;
    }
    
    this.isApplying = true;
    this.applicationError = null;
    
    console.log('Applying for opportunity:', this.cardData.id);
    
    this.applicationService.applyToOffer(this.cardData.id).subscribe(
      (response) => {
        console.log('Application response:', response);
        this.isApplying = false;
        
        if (response && response.data) {
          // Application successful
          this.hasApplied = true;
          alert('Candidatura submetida com sucesso!');
          this.closeModal();
        } else {
          // Application failed
          this.applicationError = 'Não foi possível submeter a candidatura. Tente novamente.';
        }
      },
      (error) => {
        console.error('Error applying for opportunity:', error);
        this.isApplying = false;
        this.applicationError = 'Erro ao submeter candidatura. Tente novamente mais tarde.';
      }
    );
  }
}
