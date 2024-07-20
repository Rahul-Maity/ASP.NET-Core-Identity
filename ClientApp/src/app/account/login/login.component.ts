import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccountService } from '../account.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup = new FormGroup({});
  submitted: boolean = false;
  errorMessage: string[] = [];
  constructor(private fb: FormBuilder, private accountService:AccountService) { }
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
        next:(response :any)=> {
          console.log(response);
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
