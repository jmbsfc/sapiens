import { Component, OnInit } from '@angular/core';
import { VolunteerService } from '../../services/volunteer.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.component.html',
  styleUrl: './perfil.component.css'
})
export class PerfilComponent implements OnInit {
  profileInfo: any;

  constructor(private volunteerService: VolunteerService) {}

  ngOnInit() {
    this.volunteerService.getProfileInfo().subscribe(
      (response) => {
        this.profileInfo = response.data;
        console.log(this.profileInfo);
      },
      (error) => {
        console.log('Error', error);
      }
    );
  }
}
