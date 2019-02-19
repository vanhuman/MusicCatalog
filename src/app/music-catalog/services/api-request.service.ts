import { Injectable } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpParams, HttpResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

import { ApiRequestServiceInterface } from './api-request.service.interface';

@Injectable()
export class ApiRequestService implements ApiRequestServiceInterface {
    public static API_BASE_DOMAIN = '/music-catalog-api';
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
        console.log(error);
        if (error.status === 401) { // authentication error
            this.authorisationError.next(true);
        }
        // if no custom error message available, use the http message
        if (!error.error.message) {
            error.error.message = error.message;
        }
        return throwError(error);
    }
}
