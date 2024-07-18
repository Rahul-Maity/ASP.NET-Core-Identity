import { Component, OnInit } from '@angular/core';
import { AccountService } from '../account.service';
import { FormBuilder, FormGroup, PatternValidator, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent implements OnInit{
  registerForm: FormGroup=new FormGroup({});
  submitted = false;
  errorMessage: string[] = [];

  constructor(private accountService:AccountService,private fb:FormBuilder ) { }

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

    this.accountService.register(this.registerForm.value).subscribe({
      next: (res) => {
        console.log(res);
      },
      error: error => {
        console.log(error);
      }
    })
    // console.log(this.registerForm.value);
    
  }

}
