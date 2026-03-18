import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Aromas } from './aromas';

describe('AromasComponent', () => {
  let component: Aromas;
  let fixture: ComponentFixture<Aromas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Aromas]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Aromas);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
