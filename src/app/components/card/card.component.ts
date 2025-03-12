import { NgIf } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-card',
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

  constructor(private datePipe: DatePipe) {}

  ngOnInit() {
    console.log('HERE--------------------------',this.isOrgAccount, this.cardData.organization.id)
    if(this.isOrgAccount) {
      this.isMine = this.cardData.organization.id === this.profileInfo.id
    }
    
    // Format dates
    this.formatDates();
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
  }

  closeModal() {
    this.isModalOpen = false;
    // Re-enable scrolling when modal is closed
    document.body.style.overflow = 'auto';
  }

  applyForOpportunity() {
    // TODO: Implement application logic
    console.log('Applying for opportunity:', this.cardData.id);
    alert('Candidatura submetida com sucesso!');
    this.closeModal();
  }

}
