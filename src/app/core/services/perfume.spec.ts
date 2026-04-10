import { TestBed } from '@angular/core/testing';

import { Perfume } from './perfume';

describe('Perfume', () => {
  let service: Perfume;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Perfume);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
