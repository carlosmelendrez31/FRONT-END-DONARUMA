import { TestBed } from '@angular/core/testing';

import { FamiliasOlfativas } from './familias-olfativas.service';

describe('FamiliasOlfativasService', () => {
  let service: FamiliasOlfativas;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FamiliasOlfativas);
  });
 //cambios
  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
