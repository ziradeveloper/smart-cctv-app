import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toastservice/toast';
import { finalize } from 'rxjs';
import { AuthService } from '../../services/authservice/auth';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {

  loginForm: FormGroup;
  isRegistering = false;
  isLoading = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      fullName: ['']
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.isLoading = true;
      const formdata = this.loginForm.value;
      const payload = {
        email: formdata.email,
        password: formdata.password
      };

      const request$ = this.isRegistering
        ? this.authService.register(formdata)
        : this.authService.login(payload);

      request$
      .pipe(finalize(() => {
        debugger
        this.isLoading = false
      }))
      .subscribe({
        next: (res) => {
          this.toast.show('success', this.isRegistering
            ? 'Registration successful! Welcome aboard.'
            : 'Login successful! Redirecting...', 'Success');
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          debugger
          console.error('Authentication failed:', err);
          this.toast.show('error', err.message || 'Authentication failed.', 'Error');
        }
      });
    } else {
      this.toast.show('warning', 'Please fill all required fields correctly.', 'Form Invalid');
    }
  }

  toggleMode() {
    this.isRegistering = !this.isRegistering;
    const fullNameControl = this.loginForm.get('fullName');
    if (this.isRegistering) {
      fullNameControl?.setValidators([Validators.required]);
    } else {
      fullNameControl?.clearValidators();
    }
    fullNameControl?.updateValueAndValidity();
  }

}
