import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, map } from 'rxjs';
import { AccountService } from '../../account/account.service';
import { SharedService } from '../shared.service';
import { User } from '../models/user';
export const authorizationGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot):Observable<boolean> => {
  
  const accountService = inject(AccountService);
  const sharedService = inject(SharedService);
  const router = inject(Router);
  return accountService.user$.pipe(
    map((user: User | null) => {
      if (user) { return true; }
      else {
        sharedService.showNotification(false, 'Restricted area', 'Leave immediately');
        router.navigate(['/account/login'], { queryParams: { returnUrl: state.url } });
        return false;
      }
    })
  );
  // return true;
};
