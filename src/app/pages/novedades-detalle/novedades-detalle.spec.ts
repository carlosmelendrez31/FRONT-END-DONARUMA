import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NovedadesDetalle } from './novedades-detalle';

describe('NovedadesDetalle', () => {
  let component: NovedadesDetalle;
  let fixture: ComponentFixture<NovedadesDetalle>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NovedadesDetalle]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NovedadesDetalle);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
