import { TestBed } from '@angular/core/testing';

import { Registrar } from './registrar';

describe('Registrar', () => {
  let service: Registrar;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Registrar);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
