import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApplicationService } from '../../services/application.service';
import { OportunidadesService } from '../../services/oportunidades.service';
import { AuthService } from '../../services/auth.service';
import { OrganizationService } from '../../services/organization.service';
import { ActivatedRoute } from '@angular/router';
import { ImageService } from '../../services/image.service';

interface User {
  organizationId: number;
  // Add other user properties as needed
}

@Component({
  selector: 'app-applications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './applications.component.html',
  styleUrls: ['./applications.component.css']
})
export class ApplicationsComponent implements OnInit {
  opportunities: any[] = [];
  applications: { [opportunityId: number]: any[] } = {};
  isLoading: boolean = true;
  error: string | null = null;
  organizationId: number | null = null;
  opportunityId: number | null = null;

  constructor(
    private applicationService: ApplicationService,
    private opportunitiesService: OportunidadesService,
    private authService: AuthService,
    private organizationService: OrganizationService,
    private imageService: ImageService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Get the opportunity ID from the route if it exists
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.opportunityId = +params['id'];
        console.log('Loading applications for opportunity:', this.opportunityId);
        this.loadApplicationsForOpportunity(this.opportunityId);
      } else {
        // If no opportunity ID, load all organization opportunities
        this.loadOrganizationOpportunities();
      }
    });
  }

  /**
   * Get the image URL for a volunteer
   * @param volunteer The volunteer object
   * @returns The URL to the volunteer's profile image
   */
  getVolunteerImageUrl(volunteer: any): string {
    if (!volunteer || !volunteer.user.profilePicture) {
      return this.imageService.getDefaultAvatarPath();
    }
    
    return this.imageService.getProfileImageUrl(volunteer.user.profilePicture);
  }

  /**
   * Handle image loading errors
   * @param event The error event
   */
  handleImageError(event: Event): void {
    const imgElement = event.target as HTMLImageElement;
    console.error('Error loading image:', imgElement.src);
    imgElement.src = this.imageService.getDefaultAvatarPath();
  }

  /**
   * Load applications for a specific opportunity
   */
  loadApplicationsForOpportunity(opportunityId: number): void {
    this.isLoading = true;
    this.error = null;

    // First get the opportunity details
    this.opportunitiesService.getOpportunity(opportunityId).subscribe(
      (response: { data: any }) => {
        if (response && response.data) {
          const opportunity = response.data;
          this.opportunities = [opportunity];
          
          // Then load the applications
          this.applicationService.getApplicationsForOffer(opportunityId).subscribe(
            (appResponse: { data: any[] }) => {
              if (appResponse && appResponse.data) {
                console.log('Applications data:', appResponse.data);
                this.applications[opportunityId] = appResponse.data;
              } else {
                this.applications[opportunityId] = [];
              }
              this.isLoading = false;
            },
            (error: any) => {
              console.error('Error loading applications:', error);
              this.error = 'Erro ao carregar candidaturas. Tente novamente mais tarde.';
              this.isLoading = false;
            }
          );
        } else {
          this.error = 'Oportunidade não encontrada.';
          this.isLoading = false;
        }
      },
      (error: any) => {
        console.error('Error loading opportunity:', error);
        this.error = 'Erro ao carregar oportunidade. Tente novamente mais tarde.';
        this.isLoading = false;
      }
    );
  }

  /**
   * Load all opportunities for the organization
   */
  loadOrganizationOpportunities(): void {
    this.isLoading = true;
    this.error = null;

    // Get the organization ID from the current user
    this.organizationService.getProfileInfo().subscribe(
      (response: { data: User }) => {
        if (response && response.data && response.data.organizationId) {
          this.organizationId = response.data.organizationId;
          this.loadOpportunities(this.organizationId);
        } else {
          this.error = 'Não foi possível identificar a organização.';
          this.isLoading = false;
        }
      },
      (error: any) => {
        console.error('Error getting current user:', error);
        this.error = 'Erro ao carregar dados do usuário.';
        this.isLoading = false;
      }
    );
  }

  /**
   * Load opportunities for the organization
   */
  loadOpportunities(organizationId: number): void {
    this.opportunitiesService.getOrgOpportunities(organizationId.toString()).subscribe(
      (response: { data: any[] }) => {
        console.log('Organization opportunities response:', response);
        if (response && response.data) {
          this.opportunities = response.data;
          
          // Load applications for each opportunity
          this.loadApplicationsForOpportunities();
        } else {
          this.opportunities = [];
          this.isLoading = false;
        }
      },
      (error: any) => {
        console.error('Error loading opportunities:', error);
        this.opportunities = [];
        this.isLoading = false;
        this.error = 'Erro ao carregar oportunidades. Tente novamente mais tarde.';
      }
    );
  }

  /**
   * Load applications for all opportunities
   */
  loadApplicationsForOpportunities(): void {
    const promises = this.opportunities.map(opportunity => {
      return new Promise<void>((resolve) => {
        this.applicationService.getApplicationsForOffer(opportunity.id).subscribe(
          (response: { data: any[] }) => {
            if (response && response.data) {
              console.log(`Applications for opportunity ${opportunity.id}:`, response.data);
              this.applications[opportunity.id] = response.data;
            } else {
              this.applications[opportunity.id] = [];
            }
            resolve();
          },
          (error: any) => {
            console.error(`Error loading applications for opportunity ${opportunity.id}:`, error);
            this.applications[opportunity.id] = [];
            resolve();
          }
        );
      });
    });

    Promise.all(promises).then(() => {
      this.isLoading = false;
    });
  }

  /**
   * Get applications for a specific opportunity
   */
  getApplicationsForOpportunity(opportunityId: number): any[] {
    return this.applications[opportunityId] || [];
  }

  /**
   * Check if an opportunity has any applications
   */
  hasApplications(opportunityId: number): boolean {
    return this.getApplicationsForOpportunity(opportunityId).length > 0;
  }

  /**
   * Get total number of applications
   */
  getTotalApplicationsCount(): number {
    return Object.values(this.applications).reduce((total, apps) => total + apps.length, 0);
  }
} 