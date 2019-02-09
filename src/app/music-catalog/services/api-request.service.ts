import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpParams, HttpResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

import { ApiRequestServiceInterface } from './api-request.service.interface';
import { errorCode, ErrorResponse } from '../models/api-responses/error-api-response.model';
import { AuthenticationServiceInterface } from './authentication.service.interface';

@Injectable()
export class ApiRequestService implements ApiRequestServiceInterface {
    public static API_BASE_DOMAIN = 'http://moses.test/api';

    public constructor(
        private httpClient: HttpClient,
        private authenticationService: AuthenticationServiceInterface,
    ) {
    }

    public get<T>(url: string, params: HttpParams): Observable<HttpResponse<T>> {
        return this.httpClient.get<T>(ApiRequestService.API_BASE_DOMAIN + url, {params, observe: 'response'})
            .pipe(
                catchError((error) => {
                    return this.handleError(error);
                })
            );
    }

    public post<T>(url: string, body, headers): Observable<HttpResponse<T>> {
        return this.httpClient.post<T>(ApiRequestService.API_BASE_DOMAIN + url, body, {headers, observe: 'response'})
            .pipe(
                catchError((error) => {
                    return this.handleError(error);
                })
            );
    }

    public handleError(error: HttpErrorResponse) {
        if ((<ErrorResponse>error.error).type === 'ERROR'
            && (<ErrorResponse>error.error).reference === 'AuthenticationController') {
            this.authenticationService.logOut();
            (<ErrorResponse>error.error).code = errorCode.authorisation;
        }
        // handle standard errors here
        if (error.status === 404) {
            console.log('No valid session found');
        }
        return throwError(error);
    }
}
