import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AppStorageService } from '../services/app-storage.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const appStorage = inject(AppStorageService);
  const token = appStorage.getAccessToken();

  // If we have a token, clone the request and add the Authorization header
  if (token) {
    const clonedReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
    return next(clonedReq);
  }

  // Pass through if there's no token
  return next(req);
};
