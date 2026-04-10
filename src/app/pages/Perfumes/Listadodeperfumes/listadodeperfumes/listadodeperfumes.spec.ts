import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Listadodeperfumes } from './listadodeperfumes';

describe('Listadodeperfumes', () => {
  let component: Listadodeperfumes;
  let fixture: ComponentFixture<Listadodeperfumes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Listadodeperfumes]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Listadodeperfumes);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
