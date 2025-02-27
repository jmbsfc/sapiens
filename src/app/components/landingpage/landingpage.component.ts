import { Component, OnInit, HostListener } from '@angular/core';

@Component({
  selector: 'app-landingpage',
  templateUrl: './landingpage.component.html',
  styleUrl: './landingpage.component.css'
})
export class LandingpageComponent implements OnInit {

  ngOnInit() {
    this.checkVisibility();
  }

  @HostListener('window:scroll', [])
  onWindowScroll() {
    this.checkVisibility();
  }

  checkVisibility() {
    const elements = document.querySelectorAll('.container-tutorial, .container-about');
    elements.forEach((element: any) => {
      const rect = element.getBoundingClientRect();
      if (rect.top >= 0 && rect.bottom <= (window.innerHeight || document.documentElement.clientHeight)) {
        element.classList.add('p-visible');
      }
    });
  }
}
