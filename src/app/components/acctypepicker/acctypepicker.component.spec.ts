import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AcctypepickerComponent } from './acctypepicker.component';

describe('AcctypepickerComponent', () => {
  let component: AcctypepickerComponent;
  let fixture: ComponentFixture<AcctypepickerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AcctypepickerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AcctypepickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
