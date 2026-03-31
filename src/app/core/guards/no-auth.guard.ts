import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppStorageService } from '../services/app-storage.service';

export const noAuthGuard: CanActivateFn = (route, state) => {
  const appStorage = inject(AppStorageService);
  const router = inject(Router);

  if (appStorage.isLoggedIn()) {
    // Already logged in, redirect depending on the role
    const role = appStorage.getUserRole();
    if (role === 'admin') {
      return router.parseUrl('/admin');
    } else {
      return router.parseUrl('/inicio');
    }
  }
  
  return true;
};
