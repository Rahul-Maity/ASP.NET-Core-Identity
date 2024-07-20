import { Component, OnInit } from '@angular/core';
import { AccountService } from './account/account.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  constructor(private accountService:AccountService){}
  ngOnInit(): void {
    this.refreshUser();
  }
 private  refreshUser() {
   const jwt = this.accountService.getJwt();
   if (jwt) {
     this.accountService.refreshUser(jwt).subscribe(
       {
         next: _ => { },
         error: error => {
           this.accountService.logout();
         }
       }
     )
   }
   else {
     this.accountService.refreshUser(null).subscribe();
   }
  }
  title = 'ClientApp';
}
