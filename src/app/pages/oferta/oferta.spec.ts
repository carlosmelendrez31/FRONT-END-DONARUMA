import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Oferta } from './oferta';

describe('Oferta', () => {
  let component: Oferta;
  let fixture: ComponentFixture<Oferta>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Oferta]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Oferta);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
