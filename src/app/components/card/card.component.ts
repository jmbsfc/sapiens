import { NgIf } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-card',
  imports: [NgIf],
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.css'],
})
export class CardComponent implements OnInit {
  @Input() cardData: any = {};
  @Input() profileInfo: any = {}
  @Input() isOrgAccount: any
  isModalOpen = false;
  isMine = false;

  constructor(){}

  ngOnInit(){
    console.log('HERE--------------------------',this.isOrgAccount, this.cardData.organization.id)
    if(this.isOrgAccount){
      this.isMine = this.cardData.organization.id === this.profileInfo.id
    }
  }

  openModal() {
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }
}
