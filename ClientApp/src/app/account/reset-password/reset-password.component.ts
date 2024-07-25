import { Component, OnInit } from '@angular/core';
import { AccountService } from '../account.service';
import { SharedService } from '../../shared/shared.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { take } from 'rxjs';
import { User } from '../../shared/models/user';
import { __values } from 'tslib';
import { error } from 'console';
import { ResetPassword } from '../../shared/models/account/ResetPassword';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent implements OnInit {

  token: string | undefined;
  email: string | undefined;
  submitted: boolean | undefined;
  errorMessages: string[] = [];
  resetPasswordForm: FormGroup = new FormGroup({});

  constructor(private accountService: AccountService,
    private sharedService: SharedService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder) { }


  ngOnInit(): void {
    this.accountService.user$.pipe(take(1)).subscribe({
      next: (user: User | null) => {
        if (user) {
          this.router.navigateByUrl('/');
        }
        else {
          this.activatedRoute.queryParamMap.subscribe({
            next: (params: any) => {
              this.token = params.get('token');
              this.email = params.get('email');
              if (this.token && this.email) {
                this.initializeForm(this.email);
              }

            }
          })
        }
      }
    })
  }

  initializeForm(username: string) {
    this.resetPasswordForm = this.fb.group({
      email: [{ value: username, disabled: true }],
      NewPassword: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(15)]],

    })
  }

  resetPassword() {
    this.submitted = true;
    this.errorMessages = [];
    if (this.resetPasswordForm.valid && this.token && this.email
    ) {
      const model: ResetPassword = {
        token: this.token,
        email: this.email,
        NewPassword: this.resetPasswordForm.get('NewPassword')?.value
        
      };

      this.accountService.resetPassword(model).subscribe({
        next: (res: any) => {
          this.sharedService.showNotification(true, res.value.title, res.value.message);
          this.router.navigateByUrl('/account/login');

        }, error: error => {
          if (error.error.errors) {
            this.errorMessages = error.error.errors;
          } else {
            this.errorMessages.push(error.error);
          }
        }
      })
    }
  }

}
