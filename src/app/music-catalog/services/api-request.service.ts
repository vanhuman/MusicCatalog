import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpParams, HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

import { ApiRequestServiceInterface } from './api-request.service.interface';

@Injectable()
export class ApiRequestService implements ApiRequestServiceInterface {
    private static API_BASE_DOMAIN = 'http://moses.test/api';

    public constructor(
        private httpClient: HttpClient,
    ) {
        //
    }

    public get<T>(url: string, params: HttpParams): Observable<HttpResponse<T>> {
        return this.httpClient.get<T>(ApiRequestService.API_BASE_DOMAIN + url, {params, observe: 'response'})
            .pipe(
                catchError(this.handleError)
            );
    }

    public post<T>(url: string, body, headers): Observable<HttpResponse<T>> {
        return this.httpClient.post<T>(ApiRequestService.API_BASE_DOMAIN + url, body, {headers, observe: 'response'})
            .pipe(
                catchError(this.handleError)
            );
    }

    private handleError(error: HttpErrorResponse) {
        // handle standard errors here
        if (error.status === 404) {
            console.log('No valid session found');
        }
        return throwError(error);
    }
}
