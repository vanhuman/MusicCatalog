import { Injectable } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpParams, HttpResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

import { ApiRequestServiceInterface } from './api-request.service.interface';
import { errorCode, ErrorResponse } from '../models/api-responses/error-api-response.model';

@Injectable()
export class ApiRequestService implements ApiRequestServiceInterface {
    public static API_BASE_DOMAIN = 'http://moses.test/api';
    private authorisationError: Subject<boolean> = new Subject<boolean>();

    public constructor(
        private httpClient: HttpClient,
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

    public monitorAuthorisationError(): Subject<boolean> {
        return this.authorisationError;
    }

    private handleError(error: HttpErrorResponse) {
        if ((<ErrorResponse>error.error).type === 'ERROR'
            && (<ErrorResponse>error.error).reference === 'AuthenticationController') {
            this.authorisationError.next(true);
            (<ErrorResponse>error.error).code = errorCode.authorisation;
        }
        // handle standard errors here
        if (error.status === 404) {
            console.log('No valid session found');
        }
        return throwError(error);
    }
}
