// src/app/services/common/error-handler.service.ts
import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {

  handle(error: any) {
    let message = 'An unexpected error occurred.';

    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        message = 'Unable to reach the server. Please check your connection.';
      } else if (error.status === 400) {
        message = (error.error && typeof error.error === 'string')
          ? error.error
          : 'Bad request. Please check your input.';
      } else if (error.status === 401) {
        message = 'Invalid email or password.';
      } else if (error.status === 403) {
        message = 'You are not authorized to perform this action.';
      } else if (error.status === 404) {
        message = 'Requested resource not found.';
      } else if (error.status >= 500) {
        message = 'Server error, please try again later.';
      }
    } else if (error instanceof Error) {
      message = error.message;
    }

    console.error('HTTP Error:', error);
    return throwError(() => new Error(message));
  }
}