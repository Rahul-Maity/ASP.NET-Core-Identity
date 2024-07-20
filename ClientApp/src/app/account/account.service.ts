import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Register } from '../shared/models/register';
import { environment } from '../../environments/environment.development';
import { Login } from '../shared/models/login';
import { User } from '../shared/models/user';
import { ReplaySubject, map, of } from 'rxjs';
import { Router } from '@angular/router';
// import { response } from 'express';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private userSource = new ReplaySubject<User | null>(1);
  user$ = this.userSource.asObservable();

  constructor(private http: HttpClient, private router:Router) { }

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


          // have to return from here to get into subs
          // return user;
        }
        // return null;
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
    const key = localStorage.getItem(environment.userKey);
    if (key) {
      const user: User = JSON.parse(key);
      return user.jwt;
    }
    else {
      return null;
    }

  }
  private setUser(user: User) {
    localStorage.setItem(environment.userKey, JSON.stringify(user));
    this.userSource.next(user);
    
  }
}
