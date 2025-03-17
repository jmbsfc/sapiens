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
      this.imageService.validateImageUrl(this.cardData.imageUrl).subscribe(
        (validatedUrl) => {
          this.opportunityImageUrl = validatedUrl;
          console.log('Opportunity image URL set to:', this.opportunityImageUrl);
        },
        (error) => {
          console.error('Error validating opportunity image URL:', error);
          this.opportunityImageUrl = 'cardplaceholder.png';
        }
      );
    }
    
    // Load organization logo if available
    if (this.cardData.organization && this.cardData.organization.imageUrl) {
      this.imageService.validateImageUrl(this.cardData.organization.imageUrl).subscribe(
        (validatedUrl) => {
          this.organizationLogoUrl = validatedUrl;
          console.log('Organization logo URL set to:', this.organizationLogoUrl);
        },
        (error) => {
          console.error('Error validating organization logo URL:', error);
          this.organizationLogoUrl = 'assets/images/default-organization.svg';
        }
      );
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
          
          // Check if the current user has already applied
          if (this.profileInfo && this.profileInfo.id) {
            // Use the hasUserApplied method to check if the user has already applied
            const userHasApplied = this.applicationService.hasUserApplied(
              this.cardData.id, 
              this.profileInfo.id, 
              this.applications
            );
            
            console.log('User has applied (from loadApplications):', userHasApplied);
            
            // Only update if the user has applied (to avoid overriding a true value with a false one)
            if (userHasApplied) {
              this.hasApplied = true;
              console.log('Updated hasApplied flag to true based on applications list');
            }
            
            // Also perform a direct check to ensure consistency
            this.checkExistingApplication();
          }
        } else {
          this.applications = [];
          // Don't reset hasApplied here, as it might override a true value
        }
      },
      error: (error) => {
        console.error('Error loading applications:', error);
        this.applications = [];
        // Don't reset hasApplied here, as it might override a true value
      }
    });
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
    
    // Check if user has already applied (client-side check)
    if (this.hasApplied) {
      this.applicationError = 'Já se candidatou a esta oportunidade. Cada voluntário pode candidatar-se apenas uma vez.';
      return;
    }
    
    this.isApplying = true;
    this.applicationError = null;
    
    console.log('Applying for opportunity:', this.cardData.id, 'User ID:', this.profileInfo.id);
    
    // First, use the direct server check method (most reliable)
    this.applicationService.checkDirectApplicationStatus(this.cardData.id).subscribe({
      next: (hasApplied) => {
        if (hasApplied) {
          this.isApplying = false;
          this.hasApplied = true;
          this.applicationError = 'Já se candidatou a esta oportunidade. Cada voluntário pode candidatar-se apenas uma vez.';
          
          // Update the applications list to reflect the current state
          this.loadApplications();
          return;
        }
        
        // If not applied according to direct check, try the second method
        this.checkWithSecondMethod();
      },
      error: (error) => {
        console.error('Error with direct server check:', error);
        // If error, try the second method
        this.checkWithSecondMethod();
      }
    });
  }
  
  /**
   * Second method to check if the user has already applied
   */
  private checkWithSecondMethod() {
    // Double-check for existing applications before submitting
    this.applicationService.hasVolunteerApplied(this.cardData.id, this.profileInfo.id).subscribe({
      next: (hasApplied) => {
        if (hasApplied) {
          this.isApplying = false;
          this.hasApplied = true;
          this.applicationError = 'Já se candidatou a esta oportunidade. Cada voluntário pode candidatar-se apenas uma vez.';
          
          // Update the applications list to reflect the current state
          this.loadApplications();
          return;
        }
        
        // If not applied, proceed with application
        this.submitApplication();
      },
      error: (error) => {
        console.error('Error checking existing applications:', error);
        // If error, proceed with application anyway, but be cautious
        this.submitApplication();
      }
    });
  }
  
  /**
   * Submit the application to the server
   */
  private submitApplication() {
    this.applicationService.applyToOffer(this.cardData.id).subscribe({
      next: (response) => {
        console.log('Application response:', response);
        this.isApplying = false;
        
        if (response && response.data) {
          // Application successful
          this.hasApplied = true;
          
          // Refresh the applications list
          this.loadApplications();
          
          alert('Candidatura submetida com sucesso!');
          this.closeModal();
        } else {
          // Application failed
          this.applicationError = 'Não foi possível submeter a candidatura. Tente novamente.';
        }
      },
      error: (error) => {
        console.error('Error applying for opportunity:', error);
        this.isApplying = false;
        
        if (error.message && error.message.includes('Já se candidatou')) {
          this.hasApplied = true;
          this.applicationError = 'Já se candidatou a esta oportunidade. Cada voluntário pode candidatar-se apenas uma vez.';
          
          // Refresh the applications list
          this.loadApplications();
        } else if (error.status === 403) {
          // 403 Forbidden - User has already applied
          this.hasApplied = true;
          this.applicationError = 'Já se candidatou a esta oportunidade. Cada voluntário pode candidatar-se apenas uma vez.';
          
          // Refresh the applications list
          this.loadApplications();
        } else {
          this.applicationError = 'Erro ao submeter candidatura. Tente novamente mais tarde.';
        }
      }
    });
  }

  /**
   * Check if the current user has already applied to this opportunity
   */
  checkExistingApplication() {
    if (!this.cardData || !this.cardData.id || !this.profileInfo || !this.profileInfo.id) {
      return;
    }
    
    console.log('Checking existing application for opportunity:', this.cardData.id, 'User ID:', this.profileInfo.id);
    
    // Method 1: Use the direct server check method (most reliable)
    this.applicationService.checkDirectApplicationStatus(this.cardData.id).subscribe({
      next: (hasApplied) => {
        console.log('Direct server check result:', hasApplied);
        
        // Only update if the user has applied (to avoid overriding a true value with a false one)
        if (hasApplied) {
          this.hasApplied = true;
          console.log('Updated hasApplied flag to true based on direct server check');
        }
      },
      error: (error) => {
        console.error('Error with direct server check:', error);
      }
    });
    
    // Method 2: Use the volunteer applied check method
    this.applicationService.hasVolunteerApplied(this.cardData.id, this.profileInfo.id).subscribe({
      next: (hasApplied) => {
        console.log('Volunteer applied check result:', hasApplied);
        
        // Only update if the user has applied (to avoid overriding a true value with a false one)
        if (hasApplied) {
          this.hasApplied = true;
          console.log('Updated hasApplied flag to true based on volunteer check');
        }
      },
      error: (error) => {
        console.error('Error checking existing application:', error);
      }
    });
    
    // Method 3: Also check the applications list directly
    this.applicationService.getApplicationsForOffer(this.cardData.id).subscribe({
      next: (response) => {
        if (response && response.data) {
          const applications = response.data;
          const hasApplied = applications.some((app: any) => 
            app.volunteer && app.volunteer.id === this.profileInfo.id
          );
          
          console.log('Application list check result:', {
            hasApplied,
            applications: applications.length,
            userApplications: applications.filter((app: any) => 
              app.volunteer && app.volunteer.id === this.profileInfo.id
            ).length
          });
          
          // Only update if the user has applied (to avoid overriding a true value with a false one)
          if (hasApplied) {
            this.hasApplied = true;
            console.log('Updated hasApplied flag to true based on applications list check');
          }
        }
      },
      error: (error) => {
        console.error('Error checking applications list:', error);
      }
    });
  }
}
