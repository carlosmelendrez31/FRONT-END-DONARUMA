import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegistrarAdmin } from './registrar-admin';

describe('RegistrarAdmin', () => {
  let component: RegistrarAdmin;
  let fixture: ComponentFixture<RegistrarAdmin>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegistrarAdmin]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegistrarAdmin);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
