import { TestBed } from '@angular/core/testing';

import { Ofertasadm } from './ofertasadm';

describe('Ofertasadm', () => {
  let service: Ofertasadm;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Ofertasadm);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
