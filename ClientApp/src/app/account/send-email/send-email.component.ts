import { Component, OnInit } from '@angular/core';
import { AccountService } from '../account.service';
import { SharedService } from '../../shared/shared.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { take } from 'rxjs';
import { User } from '../../shared/models/user';

@Component({
  selector: 'app-send-email',
  templateUrl: './send-email.component.html',
  styleUrl: './send-email.component.css'
})
export class SendEmailComponent implements OnInit {
  emailForm: FormGroup = new FormGroup({});
  submitted = false;
  mode: string | undefined;
  errorMessages: string[] = [];

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
          const mode = this.activatedRoute.snapshot.paramMap.get('mode');
          if (mode) {
            this.mode = mode;
            console.log(this.mode);
            
            this.initializeForm();
          }

        }
      }
    })
  }
  initializeForm() {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern('^\\w+@[a-zA-Z_]+?\\.[a-zA-Z]{2,3}$')]]
    })
  }

}
