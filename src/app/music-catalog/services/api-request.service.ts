import { Injectable } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpParams, HttpResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

import { ApiRequestServiceInterface } from './api-request.service.interface';
import { Configuration } from '../configuration';
import { isErrorApiResponse } from '../models/api-responses/error-api-response.interface';
import { errorTypeMap } from '../constants/error-type.map';

interface HttpQueueItem {
    id: number;
    observable: Observable<HttpResponse<any>>;
}

@Injectable()
export class ApiRequestService implements ApiRequestServiceInterface {
    private authorisationError: Subject<boolean> = new Subject<boolean>();
    private httpQueue: HttpQueueItem[] = [];
    private httpCalls: Map<number, Observable<HttpResponse<any>>> = new Map<number, Observable<HttpResponse<any>>>();
    private callProcessRunning = false;

    public constructor(
        private httpClient: HttpClient,
    ) {
    }

    public clearHttpQueue(): void {
        this.httpQueue = [];
    }

    public get<T>(url: string, params: HttpParams): Observable<HttpResponse<T>> {
        return this.httpClient.get<T>(Configuration.API_BASE_DOMAIN + url, {params, observe: 'response'})
            .pipe(
                catchError((error) => {
                    return this.handleError(error);
                })
            );
    }

    public getThrottled<T>(url: string, params: HttpParams, externalRequest: boolean = false): Observable<HttpResponse<T>> {
        const id = (new Date()).valueOf() + Math.random();
        const httpGetRequest = new Subject<HttpResponse<T>>();
        const httpQueueItem = new Observable<HttpResponse<T>>((observer) => {
            this.httpClient.get<T>(
                (!externalRequest ? Configuration.API_BASE_DOMAIN : '') + url,
                {params, observe: 'response'}
            ).pipe(
                catchError((error) => {
                    return this.handleError(error);
                })
            ).subscribe((result) => observer.next(result));
        });
        this.httpQueue.push({id, observable: httpQueueItem});
        const waitCallForProcess = () => {
            if (this.httpCalls.has(id)) {
                this.httpCalls.get(id).subscribe((result) => {
                    httpGetRequest.next(result);
                    httpGetRequest.complete();
                });
                this.httpCalls.delete(id);
            } else {
                setTimeout(waitCallForProcess, 30);
            }
        };
        waitCallForProcess();
        if (!this.callProcessRunning) {
            this.callProcess();
        }
        return httpGetRequest;
    }

    private callProcess(): void {
        this.callProcessRunning = true;
        const process = () => {
            if (this.httpQueue.length > 0) {
                const httpQueueItem = this.httpQueue.shift();
                this.httpCalls.set(httpQueueItem.id, httpQueueItem.observable);
                setTimeout(process, Configuration.API_THROTTLE_TIME);
            } else {
                this.callProcessRunning = false;
            }
        };
        process();
    }

    public post<T>(url: string, body, headers): Observable<HttpResponse<T>> {
        return this.httpClient.post<T>(Configuration.API_BASE_DOMAIN + url, body, {headers, observe: 'response'})
            .pipe(
                catchError((error) => {
                    return this.handleError(error);
                })
            );
    }

    public put<T>(url: string, body, headers): Observable<HttpResponse<T>> {
        return this.httpClient.put<T>(Configuration.API_BASE_DOMAIN + url, body, {headers, observe: 'response'})
            .pipe(
                catchError((error) => {
                    return this.handleError(error);
                })
            );
    }

    public delete<T>(url: string, headers): Observable<HttpResponse<T>> {
        return this.httpClient.delete<T>(Configuration.API_BASE_DOMAIN + url, {headers, observe: 'response'})
            .pipe(
                catchError((error) => {
                    return this.handleError(error);
                })
            );
    }

    public monitorAuthorisationError(): Subject<boolean> {
        return this.authorisationError;
    }

    private handleError(errorResponse: HttpErrorResponse) {
        console.log(errorResponse);
        if (errorResponse.status === 401) { // authorisation error
            this.authorisationError.next(true);
        }
        // if no custom error message available, use the http message
        if (!isErrorApiResponse(errorResponse.error)) {
            errorResponse.error.message = errorResponse.message;
            errorResponse.error.error_type = {
                id: 0,
                description: errorTypeMap.get('0'),
            };
            errorResponse.error.error_code = errorResponse.status;
            errorResponse.error.reference = 'HttpErrorResponse';
        } else {
            errorResponse.error.error_type = {
                id: errorResponse.error.error_type[0],
                description: errorResponse.error.error_type[1],
            };
        }
        return throwError(errorResponse);
    }
}
