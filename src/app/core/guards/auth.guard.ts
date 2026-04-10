import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppStorageService } from '../services/app-storage.service';

export const authGuard: CanActivateFn = (route, state) => {
  const appStorage = inject(AppStorageService);
  const router = inject(Router);

  if (appStorage.isLoggedIn()) {
    return true;
  } else {
    // Not logged in, redirect to login page (which is now root '/')
    return router.parseUrl('/');
  }
};
