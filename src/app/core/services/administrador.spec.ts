import { TestBed } from '@angular/core/testing';

import { Administrador } from './administrador';

describe('Administrador', () => {
  let service: Administrador;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Administrador);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
