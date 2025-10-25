// src/app/services/api.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  private baseUrl = environment.apiUrl; // e.g. "https://api.myapp.com"

  constructor(private http: HttpClient) {}

  // ===== Helper: Build headers =====

  private getHeaders(authorized: boolean = true): HttpHeaders {
    let headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (authorized) {
      const token = localStorage.getItem('token');
      if (token) {
        headers = headers.set('Authorization', `Bearer ${token}`);
      }
    }
    return headers;
  }

  // ===== Common CRUD =====

  getAll<T>(endpoint: string, authorized = true, params?: HttpParams): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, {
      headers: this.getHeaders(authorized),
      params
    });
  }

  getById<T>(endpoint: string, id: number | string, authorized = true): Observable<T> {
    return this.http.get<T>(`${this.baseUrl}/${endpoint}/${id}`, {
      headers: this.getHeaders(authorized)
    });
  }

  create<T>(endpoint: string, data: any, authorized = true): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, data, {
      headers: this.getHeaders(authorized)
    });
  }

  update<T>(endpoint: string, id: number | string, data: any, authorized = true): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}/${id}`, data, {
      headers: this.getHeaders(authorized)
    });
  }

  delete<T>(endpoint: string, id: number | string, authorized = true): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}/${id}`, {
      headers: this.getHeaders(authorized)
    });
  }

  // Optional: A quick POST for when you want to skip auth (login/register)
  postUnAuth<T>(endpoint: string, data: any): Observable<T> {
    return this.create(endpoint, data, false);
  }
}