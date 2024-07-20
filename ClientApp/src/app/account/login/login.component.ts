import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccountService } from '../account.service';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
import { User } from '../../shared/models/user';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup = new FormGroup({});
  submitted: boolean = false;
  errorMessage: string[] = [];
  returnUrl: string |null= null;
  constructor(private fb: FormBuilder, private accountService: AccountService, private router: Router, private activatedRoute:ActivatedRoute) { 
    this.accountService.user$.pipe(take(1)).subscribe({
      next: (user: User | null) => {
        if (user) { this.router.navigateByUrl('/'); }
        else {
          this.activatedRoute.queryParamMap.subscribe({
            next: (params: any) => {
              if (params) { this.returnUrl = params.get('returnUrl'); }
            }
          })
        }
      }
    })
  }
  ngOnInit(): void {
    this.initializeForm();
  }


  initializeForm() {
    this.loginForm = this.fb.group({

      userName: ['', Validators.required],
      password: ['', Validators.required],

    })
  }

  login()
  {
    this.submitted = true;
    this.errorMessage = [];
    if (this.loginForm.valid) {
      this.accountService.login(this.loginForm.value).subscribe({
        next: (response: any) => {
          if (this.returnUrl) { this.router.navigateByUrl(this.returnUrl); }
          else {
            this.router.navigateByUrl('/');
          }
           
        },
        error:error => {
          if (error.error.errors) { this.errorMessage = error.error.errors }
          else {
            this.errorMessage.push(error.error);
          }
        }
      }
        
      )
    }
    
  }
}
