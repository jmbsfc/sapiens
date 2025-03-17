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
  profileImageUrl: string = 'assets/images/default-avatar.svg';
  directImageError: boolean = false;
  
  // Image URL test properties
  testImageUrl: string = '';
  testImageResult: string | null = null;
  testImageSuccess: boolean = false;

  volunteerApplications: any[] = [];

  constructor(
    private volunteerService: VolunteerService,
    private organizationService: OrganizationService,
    private oportunidadesService: OportunidadesService,
    private authService: AuthService,
    private imageService: ImageService,
    private datePipe: DatePipe,
    private applicationService: ApplicationService
  ) {}

  ngOnInit() {
    // Check account type from auth service first
    this.isOrgAccount = this.authService.isOrgAccount();
    console.log('Initial account type from auth service:', this.isOrgAccount);
    
    // Test the image server
    this.testImageServer();
    
    this.loadProfileData();
  }

  /**
   * Tests if the image server is working correctly
   */
  testImageServer() {
    // Test with the profile image URL if available
    if (this.profileInfo && this.profileInfo.imageUrl) {
      const testUrl = `${this.imageService['apiUrl']}${this.profileInfo.imageUrl}`;
      console.log('Testing image server with profile image URL:', testUrl);
      
      fetch(testUrl)
        .then(response => {
          console.log('Image server test response:', response.status, response.ok);
          if (!response.ok) {
            console.warn('Image server test failed, server might not be serving images correctly');
          } else {
            console.log('Image server test successful');
          }
        })
        .catch(error => {
          console.error('Error testing image server:', error);
        });
    } else {
      // Fallback to testing with default avatar if no profile image
      const testUrl = `${this.imageService['apiUrl']}/images/default-avatar.svg`;
      console.log('Testing image server with default avatar:', testUrl);
      
      fetch(testUrl)
        .then(response => {
          console.log('Image server test response:', response.status, response.ok);
          if (!response.ok) {
            console.warn('Image server test failed, server might not be serving images correctly');
          } else {
            console.log('Image server test successful');
          }
        })
        .catch(error => {
          console.error('Error testing image server:', error);
        });
    }
  }

  loadProfileData() {
    this.isLoading = true;
    this.error = null;
    
    // Get profile data from the API
    this.volunteerService.getProfileInfo().subscribe(
      (response) => {
        console.log('Profile API response:', response);
        
        if (response && response.data) {
          this.profileInfo = response.data;
          
          // Log the profile data for debugging
          console.log('Profile data loaded:', {
            id: this.profileInfo.id,
            imageUrl: this.profileInfo.imageUrl,
            user: this.profileInfo.user,
            name: this.profileInfo.name,
            firstName: this.profileInfo.firstName,
            lastName: this.profileInfo.lastName
          });
          
          // Determine account type based on response data structure
          this.determineAccountType();
          
          // Process the profile data based on account type
          if (this.isOrgAccount) {
            console.log('Processing as organization profile');
            this.processOrganizationProfile();
          } else {
            console.log('Processing as volunteer profile');
            this.processVolunteerProfile();
          }
          
          // Set the profile image URL after processing
          this.updateProfileImageUrl();
          
          this.isLoading = false;
        } else {
          console.error('No data found in response:', response);
          this.handleProfileError();
        }
      },
      (error) => {
        console.error('Error loading profile:', error);
        this.handleProfileError();
      }
    );
  }
  
  determineAccountType() {
    // First check if the auth service says it's an org account
    const authServiceSaysOrg = this.authService.isOrgAccount();
    
    // Then check the response data structure
    const hasName = !!this.profileInfo.name;
    const hasFirstLastName = !!this.profileInfo.firstName && !!this.profileInfo.lastName;
    const userRole = this.profileInfo.user?.role || '';
    const userRoleIsOrg = userRole.toUpperCase().includes('ORGANIZATION');
    
    // Log all the factors
    console.log('Account type determination factors:');
    console.log('- Auth service says org:', authServiceSaysOrg);
    console.log('- Has name property:', hasName);
    console.log('- Has firstName and lastName:', hasFirstLastName);
    console.log('- User role:', userRole);
    console.log('- User role includes ORGANIZATION:', userRoleIsOrg);
    
    // Determine the account type based on all factors
    // If the profile has a 'name' property or the user role contains 'ORGANIZATION', it's an org
    this.isOrgAccount = hasName || userRoleIsOrg || authServiceSaysOrg;
    
    console.log('Final account type determination:', this.isOrgAccount ? 'Organization' : 'Volunteer');
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
    
    // Test the specific image path if available
    if (this.profileInfo.imageUrl) {
      this.testProfileImagePath();
      this.testAllImageFormats();
    }
    
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
    
    // Test the specific image path if available
    if (this.profileInfo.imageUrl) {
      this.testProfileImagePath();
      this.testAllImageFormats();
    }
    
    if (!this.profileInfo.firstName || !this.profileInfo.lastName) {
      console.warn('Missing name data in profile:', this.profileInfo);
    }
    
    // Load volunteer history
    this.loadVolunteerHistory();
    
    // Load volunteer applications
    this.loadVolunteerApplications();
  }

  updateProfileImageUrl() {
    if (this.profileInfo && this.profileInfo.imageUrl) {
      console.log('Setting profile image URL from:', this.profileInfo.imageUrl);
      
      // Log the image URL structure
      console.log('Image URL type:', typeof this.profileInfo.imageUrl);
      console.log('Image URL value:', this.profileInfo.imageUrl);
      
      // Ensure the image URL starts with /images/
      let imageUrl = this.profileInfo.imageUrl;
      if (!imageUrl.startsWith('/images/')) {
        imageUrl = '/images/' + imageUrl.replace(/^\/+/, '');
        console.log('Normalized image URL:', imageUrl);
      }
      
      // Use the image service to get the full URL
      const fullImageUrl = this.imageService.getImageUrl(imageUrl);
      console.log('Full image URL:', fullImageUrl);
      
      // Test if the image exists
      this.checkImageExists(fullImageUrl).then(exists => {
        if (exists) {
          console.log('Image exists at URL:', fullImageUrl);
          this.profileImageUrl = fullImageUrl;
        } else {
          console.warn('Image not found at URL:', fullImageUrl);
          this.profileImageUrl = this.imageService.getDefaultAvatarPath();
        }
      }).catch(error => {
        console.error('Error checking image existence:', error);
        this.profileImageUrl = this.imageService.getDefaultAvatarPath();
      });
    } else {
      console.log('No image URL found in profile, using default');
      this.profileImageUrl = this.imageService.getDefaultAvatarPath();
    }
  }

  /**
   * Checks if an image exists at the given URL
   * @param url The URL to check
   * @returns A promise that resolves to true if the image exists, false otherwise
   */
  checkImageExists(url: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
  }

  handleImageError() {
    console.error('Error loading profile image from URL:', this.profileImageUrl);
    
    // Try to validate the image URL
    if (this.profileInfo && this.profileInfo.imageUrl) {
      console.log('Attempting to validate image URL after error');
      
      // Use the image service to get a fresh URL
      const freshUrl = this.imageService.getImageUrl(this.profileInfo.imageUrl);
      console.log('Fresh image URL:', freshUrl);
      
      // Test if the image exists at the fresh URL
      this.checkImageExists(freshUrl).then(exists => {
        if (exists) {
          console.log('Image exists at fresh URL, updating profile image');
          this.profileImageUrl = freshUrl;
        } else {
          console.warn('Image not found at fresh URL, using default avatar');
          this.profileImageUrl = this.imageService.getDefaultAvatarPath();
        }
      }).catch(error => {
        console.error('Error checking image existence:', error);
        this.profileImageUrl = this.imageService.getDefaultAvatarPath();
      });
    } else {
      // If we get here, all attempts failed, use the default avatar
      console.error('All attempts to load profile image failed, falling back to default');
      this.profileImageUrl = this.imageService.getDefaultAvatarPath();
    }
  }

  handleDirectImageError() {
    console.error('Error loading direct image URL');
    this.directImageError = true;
  }

  handleProfileError() {
    this.error = 'Failed to load profile information. Please try again later.';
    this.isLoading = false;
    
    // Provide fallback data for testing/development
    console.log('Using fallback profile data for testing');
    this.profileInfo = {
      id: 1,
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phoneNumber: '123-456-7890',
      birthday: '01-01-1990',
      imageUrl: null
    };
    
    // Set default profile image
    this.profileImageUrl = 'assets/images/default-avatar.svg';
    
    // Show a warning in the console that we're using fallback data
    console.warn('Using fallback profile data because the API request failed');
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
                this.applicationService.getApplicationsForOffer(opp.id).subscribe(
                  (appResponse) => {
                    // Count all applications (not just accepted ones)
                    const totalCount = appResponse?.data?.length || 0;
                    
                    console.log(`Opportunity ${opp.id} has ${totalCount} total applications`);
                    
                    resolve({
                      ...opp,
                      participantsCount: totalCount
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
                participantsCount: opp.participantsCount,
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
   * Tests a specific image URL
   */
  testSpecificImageUrl() {
    if (!this.testImageUrl) {
      this.testImageResult = 'Please enter a URL to test';
      this.testImageSuccess = false;
      return;
    }

    this.testImageResult = 'Testing...';
    this.testImageSuccess = false;

    this.checkImageExists(this.testImageUrl).then(exists => {
      if (exists) {
        this.testImageResult = 'Image loaded successfully!';
        this.testImageSuccess = true;
      } else {
        this.testImageResult = 'Failed to load image from URL';
        this.testImageSuccess = false;
      }
    });
  }

  /**
   * Tests the specific image path from the profile
   */
  testProfileImagePath() {
    if (!this.profileInfo.imageUrl) return;
    
    console.log('Testing profile image path:', this.profileInfo.imageUrl);
    
    // Test direct URL construction
    const directUrl = `${this.imageService['apiUrl']}${this.profileInfo.imageUrl}`;
    console.log('Testing direct URL:', directUrl);
    
    fetch(directUrl)
      .then(response => {
        console.log('Direct URL test response:', response.status, response.ok);
        if (!response.ok) {
          console.warn('Direct URL test failed, image might not exist at this path');
        } else {
          console.log('Direct URL test successful');
        }
      })
      .catch(error => {
        console.error('Error testing direct URL:', error);
      });
    
    // Also test with the image service
    const serviceUrl = this.imageService.getImageUrl(this.profileInfo.imageUrl);
    console.log('Testing service URL:', serviceUrl);
    
    fetch(serviceUrl)
      .then(response => {
        console.log('Service URL test response:', response.status, response.ok);
        if (!response.ok) {
          console.warn('Service URL test failed, image service might not be constructing URLs correctly');
        } else {
          console.log('Service URL test successful');
        }
      })
      .catch(error => {
        console.error('Error testing service URL:', error);
      });
  }

  /**
   * Load applications made by the volunteer
   */
  loadVolunteerApplications() {
    if (!this.profileInfo || !this.profileInfo.id) {
      console.warn('No volunteer ID available to load applications');
      return;
    }
    
    console.log('Loading applications for volunteer ID:', this.profileInfo.id);
    
    // Since the API doesn't provide a direct endpoint to get applications by volunteer ID,
    // we'll need to get all opportunities and filter the ones the volunteer has applied to
    this.oportunidadesService.getOportunities().subscribe(
      (response) => {
        if (response && response.data) {
          const opportunities = response.data;
          console.log('Found opportunities:', opportunities.length);
          
          // For each opportunity, check if the volunteer has applied
          const applicationPromises = opportunities.map((opportunity: any) => {
            console.log('Checking applications for opportunity:', opportunity.id, opportunity.title);
            return new Promise<any[]>((resolve) => {
              this.applicationService.getApplicationsForOffer(opportunity.id).subscribe(
                (appResponse) => {
                  if (appResponse && appResponse.data) {
                    // Filter applications for this volunteer
                    const volunteerApps = appResponse.data.filter((app: any) => {
                      const isMatch = app.volunteer && app.volunteer.id === this.profileInfo.id;
                      if (isMatch) {
                        console.log('Found matching application:', {
                          opportunityId: opportunity.id,
                          opportunityTitle: opportunity.title,
                          applicationId: app.id,
                          status: app.status
                        });
                      }
                      return isMatch;
                    });
                    
                    // Add the opportunity data to each application
                    volunteerApps.forEach((app: any) => {
                      app.offer = opportunity;
                    });
                    
                    resolve(volunteerApps);
                  } else {
                    console.log('No applications found for opportunity:', opportunity.id);
                    resolve([]);
                  }
                },
                (error) => {
                  console.error(`Error loading applications for opportunity ${opportunity.id}:`, error);
                  resolve([]);
                }
              );
            });
          });
          
          // Wait for all application requests to complete
          Promise.all(applicationPromises).then(applicationsArrays => {
            // Flatten the array of arrays into a single array
            this.volunteerApplications = applicationsArrays.flat();
            console.log('Final volunteer applications:', {
              totalApplications: this.volunteerApplications.length,
              applications: this.volunteerApplications.map(app => ({
                id: app.id,
                opportunityId: app.offer.id,
                opportunityTitle: app.offer.title,
                status: app.status
              }))
            });
          });
        }
      },
      (error) => {
        console.error('Error loading opportunities for applications:', error);
        this.volunteerApplications = [];
      }
    );
  }

  /**
   * Tests all possible image URL formats for the profile image
   */
  testAllImageFormats() {
    if (!this.profileInfo || !this.profileInfo.imageUrl) {
      console.warn('No image URL available to test');
      return;
    }
    
    const imageUrl = this.profileInfo.imageUrl;
    console.log('Testing all possible formats for image URL:', imageUrl);
    
    // Format 1: Direct URL with API base
    const format1 = `http://localhost:8080${imageUrl}`;
    this.testImageFormat('Format 1 (Direct with API base)', format1);
    
    // Format 2: Using image service
    const format2 = this.imageService.getImageUrl(imageUrl);
    this.testImageFormat('Format 2 (Image Service)', format2);
    
    // Format 3: API base + /images/ + filename
    let filename = imageUrl;
    if (filename.startsWith('/')) {
      filename = filename.substring(1);
    }
    if (filename.startsWith('images/')) {
      filename = filename.substring(7);
    }
    const format3 = `http://localhost:8080/images/${filename}`;
    this.testImageFormat('Format 3 (API base + /images/ + filename)', format3);
    
    // Format 4: API base + /images + path
    let path = imageUrl;
    if (!path.startsWith('/')) {
      path = '/' + path;
    }
    if (!path.startsWith('/images/') && !path.startsWith('/images')) {
      path = '/images' + path;
    }
    const format4 = `http://localhost:8080${path}`;
    this.testImageFormat('Format 4 (API base + /images + path)', format4);
  }
  
  /**
   * Tests a specific image URL format
   * @param label The label for the format
   * @param url The URL to test
   */
  private testImageFormat(label: string, url: string) {
    console.log(`Testing ${label}: ${url}`);
    
    fetch(url)
      .then(response => {
        console.log(`${label} result:`, response.status, response.ok);
        if (response.ok) {
          console.log(`✅ ${label} SUCCESS`);
        } else {
          console.warn(`❌ ${label} FAILED`);
        }
      })
      .catch(error => {
        console.error(`❌ ${label} ERROR:`, error);
      });
  }
}
