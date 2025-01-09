import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OportunidadesService {

  constructor(private http:HttpClient) {
    this.getJSON().subscribe(data => {
      console.log(data);
  });
  }

  public getJSON(): Observable<any> {
      return this.http.get("./assets/offers.json")  

     // this.http.post("http:/localhost:8080/volunteers", {
     //     "firstName": "Ricardo",
     //     "lastName": "Moreira",
     //     "imageUrl": "/images/4feae695-1ec9-4566-8631-da1fd81d2d09.png",
     //    "email": "rm131700@gmail.com",
     //     "password": "Ricardo10",
     //     "birthday": "29-10-2006",
     //     "phoneNumber": "932569990",
     //     "civilId": "031677247"
     // })
  }
}
