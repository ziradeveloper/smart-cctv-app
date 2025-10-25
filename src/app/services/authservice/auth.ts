// src/app/services/authservice/auth.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, Observable, tap, throwError } from 'rxjs';
import { User } from '../../interfaces/user';
import { environment } from '../../../environments/environment';
import { ErrorHandlerService } from '../errorhandlerservice/error-handler';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private errorHandler: ErrorHandlerService
  ) {
    this.loadStoredUser();
  }

  private loadStoredUser() {
    if (typeof window === 'undefined') return;
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      this.currentUserSubject.next(JSON.parse(storedUser));
    }
  }

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Auth/register`, userData).pipe(
      tap((response: any) => this.storeUserData(response)),
      catchError((error) => this.errorHandler.handle(error))
    );
  }

  login(payload: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/Auth/login`, payload).pipe(
      tap((response: any) => {
        this.storeUserData(response);
      }),
      catchError((error) => this.errorHandler.handle(error))
      /* catchError((error) => {
        this.errorHandler.handle(error);
        return throwError(() => error);
      }) */
    );
  }

  private storeUserData(response: any) {
    if (typeof window === 'undefined') return;
    if (response.user && response.token) {
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      localStorage.setItem('token', response.token);
      this.currentUserSubject.next(response.user);
    }
  }

  logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}