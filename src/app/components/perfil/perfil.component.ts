import { Component, OnInit } from '@angular/core';
import { VolunteerService } from '../../services/volunteer.service';
import { OrganizationService } from '../../services/organization.service';
import { OportunidadesService } from '../../services/oportunidades.service';
import { AuthService } from '../../services/auth.service';
import { ImageService } from '../../services/image.service';
import { NgClass, NgFor, NgIf, DatePipe, JsonPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApplicationService } from '../../services/application.service';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [NgClass, NgFor, NgIf, DatePipe, JsonPipe, FormsModule, RouterLink],
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css',
  providers: [DatePipe]
})
export class PerfilComponent implements OnInit {
  profileInfo: any;
  isOrgAccount = false;
  orgOpportunities: any[] = [];
  volunteerHistory: any[] = [];
  isLoading = true;
  error: string | null = null;
  profileImageUrl: string = '';
  volunteerApplications: any[] = [];
  private apiUrl: string = 'http://localhost:8080';

  constructor(
    private volunteerService: VolunteerService,
    private organizationService: OrganizationService,
    private oportunidadesService: OportunidadesService,
    private authService: AuthService,
    private imageService: ImageService,
    private datePipe: DatePipe,
    private applicationService: ApplicationService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.isOrgAccount = this.authService.isOrgAccount();
    this.loadProfileData();
  }

  loadProfileData() {
    this.isLoading = true;
    this.error = null;
    console.log('Loading profile data...');
    
    this.volunteerService.getProfileInfo().subscribe(
      (response) => {
        console.log('========== PROFILE API RESPONSE ==========');
        console.log('Raw API Response:', response);
        console.log('Response data type:', typeof response.data);
        console.log('Response data JSON:', JSON.stringify(response.data, null, 2));
        console.log('===========================================');
        
        if (response && response.data) {
          this.profileInfo = response.data;
          console.log('+++++++++++++++++++++++++++++++++++++++Profile info imageUrl:', this.profileInfo.user.profilePicture);
          
          // Process based on account type
          this.determineAccountType();
        } else {
          this.handleProfileError();
        }
      },
      (error) => {
        console.error('Error loading profile:', error);
        this.handleProfileError();
      }
    );
  }

  updateProfileImageUrl() {
    console.log('Updating profile image URL from profileInfo:', this.profileInfo);
    
    // Check for imageUrl in the profileInfo data
    if (this.profileInfo.user && this.profileInfo.user.profilePicture) {

      // Make sure the path starts with a slash
      let imageUrl = this.profileInfo.user.profilePicture;
      if (!imageUrl.startsWith('/')) {
        imageUrl = '/' + imageUrl;
      }
      
      // Construct the full URL by adding the base API URL
      this.profileImageUrl = `http://localhost:8080${imageUrl}`;
    } 
    // If no image is found, use default
    else {
      console.log('No image URL found in profile info, using default avatar');
      this.profileImageUrl = 'assets/images/default-avatar.png';
      console.log('Default avatar path:', this.profileImageUrl);
    }
  }

  handleProfileError() {
    this.error = 'Failed to load profile information. Please try again later.';
    this.isLoading = false;
    this.profileImageUrl = ''; // Ensure no default avatar is set
  }

  determineAccountType() {
    // First check if the auth service says it's an org account
    this.isOrgAccount = this.authService.isOrgAccount();
    
    console.log('Account type from auth service:', this.isOrgAccount ? 'Organization' : 'Volunteer');
    
    // Additional check from the user data itself
    if (this.profileInfo && this.profileInfo.user && this.profileInfo.user.role) {
      // Role-based determination (if there's a user object with role)
      if (this.profileInfo.user.role.includes('ORG')) {
        this.isOrgAccount = true;
        console.log('Account type determined from user role: Organization');
      } else {
        console.log('Account type determined from user role: Volunteer');
      }
    }
    
    console.log('Final account type:', this.isOrgAccount ? 'Organization' : 'Volunteer');
    
    // Process profile based on account type
    if (this.isOrgAccount) {
      this.processOrganizationProfile();
    } else {
      this.processVolunteerProfile();
    }
    
    this.updateProfileImageUrl();
    this.isLoading = false;
  }
  
  processOrganizationProfile() {
    // Ensure we have the organization's data properly mapped
    if (!this.profileInfo.email && this.profileInfo.user && this.profileInfo.user.email) {
      this.profileInfo.email = this.profileInfo.user.email;
    }
    
    if (!this.profileInfo.phoneNumber && this.profileInfo.user && this.profileInfo.user.phoneNumber) {
      this.profileInfo.phoneNumber = this.profileInfo.user.phoneNumber;
    }
    
    // Set profile image URL
    this.updateProfileImageUrl();
    
    // Load organization opportunities
    this.loadOrgOpportunities();
  }
  
  processVolunteerProfile() {
    // Ensure we have the volunteer's data properly mapped
    if (!this.profileInfo.email && this.profileInfo.user && this.profileInfo.user.email) {
      this.profileInfo.email = this.profileInfo.user.email;
    }
    
    if (!this.profileInfo.phoneNumber && this.profileInfo.user && this.profileInfo.user.phoneNumber) {
      this.profileInfo.phoneNumber = this.profileInfo.user.phoneNumber;
    }
    
    // Set profile image URL
    this.updateProfileImageUrl();
    
    if (!this.profileInfo.firstName || !this.profileInfo.lastName) {
      console.warn('Missing name data in profile:', this.profileInfo);
    }
    
    // Load volunteer history
    this.loadVolunteerHistory();
    
    // Load volunteer applications
    this.loadVolunteerApplications();
  }

  loadVolunteerHistory() {
    if (this.profileInfo && this.profileInfo.id) {
      // In a real application, we would fetch the volunteer's participation history
      // For now, we'll use the oportunidadesService to get all opportunities and filter
      this.oportunidadesService.getOportunities().subscribe(
        (response) => {
          if (response && response.data) {
            // Filter opportunities where this volunteer has participated
            // This is a placeholder implementation - in a real app, you'd have an API endpoint for this
            this.volunteerHistory = response.data.filter((opp: any) => 
              opp.participants && opp.participants.some((p: any) => p.id === this.profileInfo.id)
            ).map((opp: any) => ({
              id: opp.id,
              title: opp.title,
              description: opp.description,
              date: opp.startDate,
              endDate: opp.endDate,
              organization: opp.organization ? opp.organization.name : 'Unknown Organization',
              address: opp.address,
              expanded: false
            }));
          }
        },
        (error) => {
          console.error('Error loading volunteer history:', error);
          // Fallback to placeholder data for demo purposes
    this.volunteerHistory = [
      {
        id: 1,
        title: 'Limpeza de Praia',
        description: 'Participação na limpeza da Praia da Costa da Caparica, recolhendo resíduos plásticos e outros materiais poluentes.',
        date: '2023-06-15',
              endDate: '2023-06-15',
        organization: 'Oceano Limpo',
              address: 'Costa da Caparica, Almada',
        expanded: false
      },
      {
        id: 2,
        title: 'Distribuição de Alimentos',
        description: 'Ajuda na distribuição de refeições para pessoas em situação de vulnerabilidade no centro de Lisboa.',
        date: '2023-04-22',
              endDate: '2023-04-22',
        organization: 'Comunidade Solidária',
              address: 'Centro de Lisboa',
        expanded: false
      }
    ];
        }
      );
    }
  }

  loadOrgOpportunities() {
    if (this.profileInfo && this.profileInfo.id) {
      console.log('Loading opportunities for organization ID:', this.profileInfo.id);
      
      // Use the specific endpoint for organization opportunities
      this.oportunidadesService.getOrgOpportunities(this.profileInfo.id).subscribe(
        (response) => {
          if (response && response.data) {
            console.log('Organization opportunities loaded:', response.data);
            
            // Make sure we're only showing opportunities for this organization
            const orgId = this.profileInfo.id;
            const filteredOpps = Array.isArray(response.data) 
              ? response.data.filter((opp: any) => 
                  opp.organization && opp.organization.id === orgId)
              : [];
              
            console.log('Filtered opportunities for this organization:', filteredOpps);
            
            // For each opportunity, get the number of applications
            const opportunityPromises = filteredOpps.map((opp: any) => {
              return new Promise<any>((resolve) => {
                // Get applications for this opportunity
                this.applicationService.getApplicationsForOffer(opp.id).subscribe(
                  (appResponse) => {
                    let participantsCount = 0;
                    
                    if (appResponse && appResponse.data && Array.isArray(appResponse.data)) {
                      participantsCount = appResponse.data.length;
                      console.log(`Opportunity ${opp.id} has ${participantsCount} applications from API`);
                    }
                    
                    resolve({
                      ...opp,
                      participantsCount: participantsCount
                    });
                  },
                  (error) => {
                    console.error(`Error loading applications for opportunity ${opp.id}:`, error);
                    resolve({
                      ...opp,
                      participantsCount: 0
                    });
                  }
                );
              });
            });
            
            // Wait for all application counts to complete
            Promise.all(opportunityPromises).then(opportunitiesWithCounts => {
              this.orgOpportunities = opportunitiesWithCounts.map((opp: any) => ({
                id: opp.id,
                title: opp.title,
                description: opp.description,
                startDate: opp.startDate,
                endDate: opp.endDate,
                address: opp.address,
                category: opp.category ? opp.category.name : 'Uncategorized',
                municipality: opp.municipality ? opp.municipality.name : 'Unknown Location',
                participantsCount: opp.participantsCount || 0,
                expanded: false
              }));
              
              console.log('Final opportunities with participant counts:', this.orgOpportunities);
            });
          } else {
            console.log('No opportunities data found for organization');
            this.orgOpportunities = [];
          }
        },
        (error) => {
          console.error('Error loading organization opportunities:', error);
          this.orgOpportunities = [];
        }
      );
    } else {
      console.error('No organization ID found in profile data');
      this.orgOpportunities = [];
    }
  }

  toggleHistoryItem(item: any) {
    // Toggle expanded state for history items
    item.expanded = !item.expanded;
  }

  formatDate(date: string): string {
    if (!date) return 'N/A';
    
    try {
      console.log('Formatting date:', date);
      
      // Check if the date is already in dd-mm-yyyy format
      if (/^\d{2}-\d{2}-\d{4}$/.test(date)) {
        // Already in the correct format, just return it
        return date;
      }
      
      // Check if the date ends with "0017" (the specific issue we were seeing)
      if (date.endsWith('0017')) {
        console.log('Detected date with 0017 issue:', date);
        // Extract the actual date part
        const actualDate = date.substring(0, 10);
        console.log('Extracted actual date:', actualDate);
        
        // Try to parse this date
        return this.parseAndFormatDate(actualDate);
      }
      
      // Try standard parsing
      return this.parseAndFormatDate(date);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Erro de formato';
    }
  }
  
  // Helper method to parse and format dates
  private parseAndFormatDate(dateStr: string): string {
    // Try to parse as yyyy-mm-dd
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const parts = dateStr.split('-');
      // Return as dd/mm/yyyy for display
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    
    // Try to parse as dd-mm-yyyy
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) {
      const parts = dateStr.split('-');
      // Return as dd/mm/yyyy for display
      return `${parts[0]}/${parts[1]}/${parts[2]}`;
    }
    
    // Try standard date parsing as fallback
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      console.error('Invalid date format:', dateStr);
      return 'Data inválida';
    }
    
    // Format using DatePipe
    return this.datePipe.transform(date, 'dd/MM/yyyy') || 'N/A';
  }

  /**
   * Load applications made by the volunteer
   */
  loadVolunteerApplications() {
    if (!this.profileInfo || !this.profileInfo.id) {
      console.warn('No volunteer ID available to load applications');
      this.volunteerApplications = [];
      this.isLoading = false;
      return;
    }
    
    console.log('Loading applications for volunteer ID:', this.profileInfo.id);
    
    // Use the dedicated endpoint for getting current volunteer's applications
    this.applicationService.getMyApplications().subscribe(
      (response) => {
        if (response && response.data) {
          console.log('My applications response:', response);
          
          // Get the raw applications data
          const myApplications = response.data;
          
          // If there are no applications, set empty array and return early
          if (!myApplications || myApplications.length === 0) {
            console.log('No applications found for this volunteer');
            this.volunteerApplications = [];
            this.isLoading = false;
            return;
          }
          
          // For each application, we need to get the offer details
          const applicationPromises = myApplications.map((application: any) => {
            return new Promise<any>((resolve) => {
              // If the offer is already included in the application data, use it
              if (application.offer) {
                resolve(application);
                return;
              }
              
              // Otherwise, fetch the offer details
              const offerId = application.offer?.id || application.offerId;
              if (offerId) {
                this.oportunidadesService.getOpportunity(offerId).subscribe(
                  (offerResponse) => {
                    if (offerResponse && offerResponse.data) {
                      application.offer = offerResponse.data;
                    }
                    resolve(application);
                  },
                  (error) => {
                    console.error(`Error loading offer ${offerId} for application:`, error);
                    resolve(application);
                  }
                );
              } else {
                console.warn('Application has no offer ID:', application);
                resolve(application);
              }
            });
          });
          
          // Wait for all applications to be processed
          Promise.all(applicationPromises).then(applications => {
            this.volunteerApplications = applications;
            console.log('Final volunteer applications:', this.volunteerApplications);
            this.isLoading = false;
          });
        } else {
          console.warn('No applications data found in response:', response);
          this.volunteerApplications = [];
          this.isLoading = false;
        }
      },
      (error) => {
        console.error('Error loading volunteer applications:', error);
        this.volunteerApplications = [];
        this.isLoading = false;
      }
    );
  }

  /**
   * Delete an opportunity created by the organization
   * @param id The ID of the opportunity to delete
   */
  deleteOpportunity(id: number) {
    if (confirm('Tem a certeza que pretende eliminar esta oportunidade? Esta ação não pode ser desfeita.')) {
      this.oportunidadesService.deleteOpportunity(id).subscribe(
        (response) => {
          console.log('Opportunity deleted successfully', response);
          
          // Remove from the local list to update the UI
          this.orgOpportunities = this.orgOpportunities.filter(opp => opp.id !== id);
        },
        (error) => {
          console.error('Error deleting opportunity:', error);
          alert('Ocorreu um erro ao eliminar a oportunidade. Por favor, tente novamente.');
        }
      );
    }
  }

  /**
   * Cancel an application made by the volunteer
   * @param applicationId The ID of the application to cancel
   */
  cancelApplication(applicationId: number) {
    if (confirm('Tem a certeza que pretende cancelar esta candidatura? Esta ação não pode ser desfeita.')) {
      // Show loading state
      this.isLoading = true;
      
      this.applicationService.cancelApplication(applicationId).subscribe(
        (response) => {
          console.log('Application canceled successfully', response);
          
          // Don't try to filter immediately - reload all applications from server
          this.volunteerApplications = [];
          
          // Reload all applications to ensure the UI is synchronized with the server
          setTimeout(() => {
            this.loadVolunteerApplications();
            this.isLoading = false;
          }, 500); // Small delay to ensure server has processed the deletion
        },
        (error) => {
          console.error('Error canceling application:', error);
          this.isLoading = false;
          alert('Ocorreu um erro ao cancelar a candidatura. Por favor, tente novamente.');
        }
      );
    }
  }
}
