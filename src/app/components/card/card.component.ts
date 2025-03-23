import { NgIf } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ApplicationService } from '../../services/application.service';
import { VolunteerService } from '../../services/volunteer.service';
import { ImageService } from '../../services/image.service';

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
  
  // Image URLs
  opportunityImageUrl: string = 'cardplaceholder.png';
  organizationLogoUrl: string = 'assets/images/default-organization.svg';
  
  // Application related properties
  applications: any[] = [];
  hasApplied: boolean = false;
  isApplying: boolean = false;
  applicationError: string | null = null;

  constructor(
    private datePipe: DatePipe,
    private applicationService: ApplicationService,
    private volunteerService: VolunteerService,
    private imageService: ImageService
  ) {}

  ngOnInit() {
    console.log('Card component initialized with data:', this.cardData);
    console.log('Profile info:', this.profileInfo);
    console.log('Is org account:', this.isOrgAccount);
    
    if(this.isOrgAccount) {
      this.isMine = this.cardData.organization?.id === this.profileInfo.id
    }
    
    // Format dates
    this.formatDates();
    
    // Load images
    this.loadImages();
    
    // Load applications for this opportunity
    this.loadApplications();
    
    // Force a check for existing applications after a short delay
    // This helps ensure the hasApplied flag is set correctly
    setTimeout(() => {
      this.checkExistingApplication();
    }, 500);
    
    // Add another check after a longer delay to catch any late responses
    setTimeout(() => {
      if (!this.hasApplied) {
        console.log('Running final application check...');
        this.checkExistingApplication();
      }
    }, 2000);
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
    
    // Also check for existing applications
    this.checkExistingApplication();
  }

  closeModal() {
    this.isModalOpen = false;
    // Re-enable scrolling when modal is closed
    document.body.style.overflow = 'auto';
  }

  /**
   * Load and validate images for the opportunity and organization
   */
  loadImages() {
    // Load opportunity image if available
    if (this.cardData.imageUrl) {
      this.opportunityImageUrl = this.imageService.getImageUrl(this.cardData.imageUrl);
      console.log('Opportunity image URL set to:', this.opportunityImageUrl);
    }
    
    // Load organization logo if available
    if (this.cardData.organization && this.cardData.organization.imageUrl) {
      this.organizationLogoUrl = this.imageService.getImageUrl(this.cardData.organization.imageUrl);
      console.log('Organization logo URL set to:', this.organizationLogoUrl);
    }
  }

  /**
   * Load applications for this opportunity
   */
  loadApplications() {
    if (!this.cardData || !this.cardData.id) {
      console.warn('No opportunity ID available to load applications');
      return;
    }
    
    // Load all applications for this opportunity
    this.applicationService.getApplicationsForOffer(this.cardData.id).subscribe({
      next: (response) => {
        console.log('Applications response:', response);
        if (response && response.data) {
          this.applications = response.data;
          // Check application status using the new endpoint
          this.checkExistingApplication();
        } else {
          this.applications = [];
        }
      },
      error: (error) => {
        console.error('Error loading applications:', error);
        this.applications = [];
      }
    });
  }

  /**
   * Apply for the opportunity
   */
  applyForOpportunity() {
    if (!this.cardData || !this.cardData.id) {
      console.warn('No opportunity ID available for application');
      return;
    }

    this.isApplying = true;
    this.applicationError = null;

    // Submit the application
    this.submitApplication();
  }

  /**
   * Submit the application to the server
   */
  private submitApplication() {
    this.applicationService.applyToOffer(this.cardData.id).subscribe({
      next: (response) => {
        console.log('Application submitted successfully:', response);
        this.hasApplied = true;
        this.isApplying = false;
        // Reload applications to get the updated list
        this.loadApplications();
      },
      error: (error) => {
        console.error('Error submitting application:', error);
        this.applicationError = error.message || 'Erro ao enviar candidatura. Tente novamente mais tarde.';
        this.isApplying = false;
      }
    });
  }

  /**
   * Check if the user has already applied to this opportunity
   */
  checkExistingApplication() {
    if (!this.cardData || !this.cardData.id) {
      console.warn('No opportunity ID available to check application status');
      return;
    }
    
    if (this.isOrgAccount) {
      console.log('Organization account - skipping application check');
      return;
    }
    
    console.log('Checking application status for opportunity:', this.cardData.id);
    
    // Use the direct check endpoint
    this.applicationService.checkDirectApplicationStatus(this.cardData.id).subscribe({
      next: (hasApplied) => {
        console.log('Application status result:', hasApplied);
        this.hasApplied = hasApplied;
      },
      error: (error) => {
        console.error('Error checking application status:', error);
      }
    });
  }
}
