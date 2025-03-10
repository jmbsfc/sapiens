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
        // Try to parse the date string if it's not already a Date object
        const startDate = typeof this.cardData.startDate === 'string' 
          ? new Date(this.cardData.startDate.replace(/-/g, '/')) 
          : this.cardData.startDate;
          
        this.formattedStartDate = this.datePipe.transform(startDate, 'dd/MM/yyyy') || this.cardData.startDate;
      }
      
      if (this.cardData && this.cardData.endDate) {
        // Try to parse the date string if it's not already a Date object
        const endDate = typeof this.cardData.endDate === 'string' 
          ? new Date(this.cardData.endDate.replace(/-/g, '/')) 
          : this.cardData.endDate;
          
        this.formattedEndDate = this.datePipe.transform(endDate, 'dd/MM/yyyy') || this.cardData.endDate;
      }
    } catch (error) {
      console.error('Error formatting dates:', error);
      // Fallback to original values if formatting fails
      this.formattedStartDate = this.cardData.startDate;
      this.formattedEndDate = this.cardData.endDate;
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
