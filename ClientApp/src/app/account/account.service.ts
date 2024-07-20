import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Register } from '../shared/models/register';
import { environment } from '../../environments/environment.development';
import { Login } from '../shared/models/login';
import { User } from '../shared/models/user';
import { ReplaySubject, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  private userSource = new ReplaySubject<User | null>(1);
  user$ = this.userSource.asObservable();

  constructor(private http: HttpClient) { }

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
  register(model: Register) {
   return this.http.post(`${environment.appUrl}/api/Account/register`, model);
  }

  private setUser(user: User) {
    localStorage.setItem(environment.userKey, JSON.stringify(user));
    this.userSource.next(user);
  }
}
