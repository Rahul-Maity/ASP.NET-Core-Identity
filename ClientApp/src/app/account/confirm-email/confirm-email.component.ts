import { Component, OnInit } from '@angular/core';
import { AccountService } from '../account.service';
import { SharedService } from '../../shared/shared.service';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
import { User } from '../../shared/models/user';
import { ConfirmEmail } from '../../shared/models/account/ConfirmEmail';

@Component({
  selector: 'app-confirm-email',
  templateUrl: './confirm-email.component.html',
  styleUrl: './confirm-email.component.css'
})
export class ConfirmEmailComponent implements OnInit{


  constructor(private accountService: AccountService,
    private sharedService: SharedService,
    private router: Router,
    private activatedRoute: ActivatedRoute) { }
  
  success: boolean = true;
  ngOnInit(): void {
    this.accountService.user$.pipe(take(1)).subscribe({
      next: (user: User | null) => {
        if (user) {
          this.router.navigateByUrl('/');
        }
        else {
          this.activatedRoute.queryParamMap.subscribe({
            next: (params: any) => {
              const confirmEmail: ConfirmEmail = {
                Token: params.get('token'),
                Email:params.get('email')
              }
              this.accountService.confirmEmail(confirmEmail).subscribe({
                next: (response: any) => {
                  this.sharedService.showNotification(true, 'success', 'Email confirmed successfully');

                },
                error: error => {
                  this.success = false;
                  this.sharedService.showNotification(false, 'Failed', error.error);
                }
              })
            }
          })
        }
      }
    })
  }

  resendEmailConfirmation() {
    this.router.navigateByUrl('/account/send-email/resend-email-confirmation-link');
    }

}
