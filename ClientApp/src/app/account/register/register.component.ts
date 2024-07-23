import { Component, OnInit } from '@angular/core';
import { AccountService } from '../account.service';
import { FormBuilder, FormGroup, PatternValidator, Validators } from '@angular/forms';
import { SharedService } from '../../shared/shared.service';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { User } from '../../shared/models/user';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit{
  registerForm: FormGroup=new FormGroup({});
  submitted = false;
  errorMessage: string[] = [];

  constructor(private accountService: AccountService, private fb: FormBuilder, private sharedService: SharedService, private router: Router) { 
    this.accountService.user$.pipe(take(1)).subscribe({
      next: (user: User|null) => {
        if (user) {
          this.router.navigateByUrl('/');
        }
      }
    })
  }

  ngOnInit(): void {
    this.initializeForm();
  }
  initializeForm() {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]],
      lastName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(15)]],
      email: ['', [Validators.required, Validators.pattern('^\\w+@[a-zA-Z_]+?\\.[a-zA-Z]{2,3}$')]],
      password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(15)]],
      
    })
  }
  register()
  {
    this.submitted = true;
    this.errorMessage = [];
    if (this.registerForm.valid) {
      this.accountService.register(this.registerForm.value).subscribe({
        next: (res: any) => {
          this.sharedService.showNotification(true,res.value.title, res.value.message);
          this.router.navigateByUrl('/account/login');

          console.log(res);
        },
        error: error => {
          if (error.error.errors)
          {
            this.errorMessage = error.error.errors;
          }
          else {
            this.errorMessage.push(error.error);
          }
        }
      })
    }
   
    
    
  }

}
