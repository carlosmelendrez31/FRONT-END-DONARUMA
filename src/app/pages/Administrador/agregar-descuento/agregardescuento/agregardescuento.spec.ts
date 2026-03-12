import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Agregardescuento } from './agregardescuento';

describe('Agregardescuento', () => {
  let component: Agregardescuento;
  let fixture: ComponentFixture<Agregardescuento>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Agregardescuento]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Agregardescuento);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
