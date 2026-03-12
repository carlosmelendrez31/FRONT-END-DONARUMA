import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalComprarPerfumes } from './modal-comprar-perfumes';

describe('ModalComprarPerfumes', () => {
  let component: ModalComprarPerfumes;
  let fixture: ComponentFixture<ModalComprarPerfumes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalComprarPerfumes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalComprarPerfumes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
