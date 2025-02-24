import { Component, OnInit } from '@angular/core';
import { CardComponent } from '../card/card.component';
import { OportunidadesService } from '../../services/oportunidades.service';
import { NgFor } from '@angular/common';


@Component({
  selector: 'app-oportunidades',
  imports: [CardComponent,NgFor],
  templateUrl: './oportunidades.component.html',
  styleUrl: './oportunidades.component.css'
})
export class OportunidadesComponent implements OnInit {
  data: any;

  constructor(private oportunidadesService: OportunidadesService) {}
  
  ngOnInit(){
    // aqui vou aribuir os dados do serviços aka JSON à variável
    this.oportunidadesService.getJSON().subscribe(data => {
      this.data = data;
      this.data.map((oneData:any) => 
        console.log(oneData)

      )
    })
  }
}
