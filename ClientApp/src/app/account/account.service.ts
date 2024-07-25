import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Register } from '../shared/models/register';
import { environment } from '../../environments/environment.development';
import { Login } from '../shared/models/login';
import { User } from '../shared/models/user';
import { ReplaySubject, map, of } from 'rxjs';
import { Router } from '@angular/router';
import { ConfirmEmail } from '../shared/models/account/ConfirmEmail';
import { ResetPassword } from '../shared/models/account/ResetPassword';
// import { response } from 'express';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private userSource = new ReplaySubject<User | null>(1);
  user$ = this.userSource.asObservable();

  constructor(private http: HttpClient, private router: Router) { }

  refreshUser(jwt: string | null) {
    if (jwt === null) {
      this.userSource.next(null);
      return of(undefined);
    }
    let headers = new HttpHeaders();
    headers = headers.set('Authorization', 'Bearer ' + jwt);
    return this.http.get<User>(`${environment.appUrl}/api/Account/refresh-user-token`, { headers }).pipe(
      map((user: User) => {
        if (user) { this.setUser(user); }
      })
    )

  }

  login(model: Login) {
    return this.http.post<User>(`${environment.appUrl}/api/Account/login`, model).pipe(
      map((user: User) => {
        if (user) {
          this.setUser(user);

        }

      })
    );
  }

  logout() {
    localStorage.removeItem(environment.userKey);
    this.userSource.next(null);
    this.router.navigateByUrl('/');

  }
  register(model: Register) {
    return this.http.post(`${environment.appUrl}/api/Account/register`, model);
  }
  getJwt() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const key = localStorage.getItem(environment.userKey);
      if (key) {
        const user: User = JSON.parse(key);
        return user.jwt;
      }
      else {
        return null;
      }
    }
    return null;



  }
  confirmEmail(model: ConfirmEmail) {
    return this.http.put(`${environment.appUrl}/api/Account/confirm-email`, model);

  }
  resendEmailConfirmationLink(email: string) {
    return this.http.post(`${environment.appUrl}/api/Account/resend-email-confirmation-link/${email}`, {});
  }
  forgotUsernameOrPassword(email: string) {
    return this.http.post(`${environment.appUrl}/api/Account/forgot-username-or-password/${email}`, {});
  }

  resetPassword(model: ResetPassword) {
    return this.http.post( `${environment.appUrl}/api/Account/reset-password`, model);

  }
  private setUser(user: User) {
    localStorage.setItem(environment.userKey, JSON.stringify(user));
    this.userSource.next(user);

  }
}
