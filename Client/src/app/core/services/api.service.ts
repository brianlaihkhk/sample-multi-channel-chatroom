import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpHeaders, HttpClient, HttpParams } from '@angular/common/http';
import { Observable ,  throwError } from 'rxjs';
import { Response } from '../models'

import { JwtService } from './jwt.service';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class ApiService {
  constructor(
    private http: HttpClient,
    private headers: HttpHeaders,
    private jwtService: JwtService
  ) {}

  private formatErrors(error: any) {
    return  throwError(error.error);
  }

  private setHeader() {
    this.headers.set({'Authorization' : 'Bearer ' + this.jwtService.getToken()});
  }

  get(path: string, params: HttpParams = new HttpParams()): Observable<any> {
    this.setHeader();

    return this.http.get(`${environment.api_url}${path}`, { params : params, headers: this.headers })
      .pipe(map( (data:Response) => {
                  if (!data.success) {
                    throwError('Response not success')
                  }
                  return data;
                }),
            catchError(this.formatErrors));
  }

  put(path: string, body: Object = {}): Observable<any> {
    this.setHeader();

    return this.http.put(
      `${environment.api_url}${path}`,
      JSON.stringify(body),
      { headers: this.headers }
    ).pipe( map( (data:Response) => {
              if (!data.success) {
                throwError('Response not success')
              }
              return data;
            }),
            catchError(this.formatErrors));
  }

  post(path: string, body: Object = {}): Observable<any> {
    this.setHeader();

    return this.http.post(
      `${environment.api_url}${path}`,
      JSON.stringify(body),
      { headers: this.headers }
    ).pipe(map( (data:Response) => {
            if (!data.success) {
              throwError('Response not success')
            }
            return data;
          }),catchError(this.formatErrors));
  }

  delete(path): Observable<any> {
    this.setHeader();

    return this.http.delete(
      `${environment.api_url}${path}`,
      { headers: this.headers }
    ).pipe(map( (data:Response) => {
            if (!data.success) {
              throwError('Response not success')
            }
            return data;
          }),catchError(this.formatErrors));
  }
}
