import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PagoExitosoComponent } from './pago-exitoso'; //  Cambio aquí

describe('PagoExitosoComponent', () => { //  Cambio aquí
  let component: PagoExitosoComponent; //  Cambio aquí
  let fixture: ComponentFixture<PagoExitosoComponent>; //  Cambio aquí

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PagoExitosoComponent] //  Cambio aquí
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PagoExitosoComponent); //  Cambio aquí
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});