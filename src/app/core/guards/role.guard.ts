import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AppStorageService } from '../services/app-storage.service';

export const roleGuard: CanActivateFn = (route, state) => {
  const appStorage = inject(AppStorageService);
  const router = inject(Router);
  
  if (!appStorage.isLoggedIn()) {
    return router.parseUrl('/login');
  }

  const expectedRole = route.data['role'];
  const userRole = appStorage.getUserRole();
  const allowedRoles = Array.isArray(expectedRole) ? expectedRole : [expectedRole];

  if (!expectedRole || allowedRoles.includes(userRole)) {
    return true;
  } else {
    // Logged in but doesn't have the role
    return router.parseUrl('/inicio');
  }
};
