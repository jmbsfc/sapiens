import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgsignupComponent } from './orgsignup.component';

describe('OrgsignupComponent', () => {
  let component: OrgsignupComponent;
  let fixture: ComponentFixture<OrgsignupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrgsignupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OrgsignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
