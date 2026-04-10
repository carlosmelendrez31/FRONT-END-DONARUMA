import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Agregarperfume } from './agregarperfume';

describe('Agregarperfume', () => {
  let component: Agregarperfume;
  let fixture: ComponentFixture<Agregarperfume>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Agregarperfume]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Agregarperfume);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
