import { Injectable } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpParams, HttpResponse } from '@angular/common/http';
import { catchError } from 'rxjs/operators';

import { ApiRequestServiceInterface } from './api-request.service.interface';

interface HttpQueueItem {
    id: number;
    observable: Observable<HttpResponse<any>>;
}

@Injectable()
export class ApiRequestService implements ApiRequestServiceInterface {
    public static API_BASE_DOMAIN = '/music-catalog-api';

    private static THROTTLE_TIME = 250;
    private authorisationError: Subject<boolean> = new Subject<boolean>();
    private httpQueue: HttpQueueItem[] = [];
    private httpCalls: Map<number, Observable<HttpResponse<any>>> = new Map<number, Observable<HttpResponse<any>>>();
    private callProcessRunning = false;

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

    public getThrottled<T>(url: string, params: HttpParams, externalRequest: boolean = false): Observable<HttpResponse<T>> {
        const id = (new Date()).valueOf() + Math.random();
        const httpGetRequest = new Subject<HttpResponse<T>>();
        const httpQueueItem = new Observable<HttpResponse<T>>((observer) => {
            this.httpClient.get<T>(
                (!externalRequest ? ApiRequestService.API_BASE_DOMAIN : '') + url,
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
                setTimeout(process, ApiRequestService.THROTTLE_TIME);
            } else {
                this.callProcessRunning = false;
            }
        };
        process();
    }

    public post<T>(url: string, body, headers): Observable<HttpResponse<T>> {
        return this.httpClient.post<T>(ApiRequestService.API_BASE_DOMAIN + url, body, {headers, observe: 'response'})
            .pipe(
                catchError((error) => {
                    return this.handleError(error);
                })
            );
    }

    public put<T>(url: string, body, headers): Observable<HttpResponse<T>> {
        return this.httpClient.put<T>(ApiRequestService.API_BASE_DOMAIN + url, body, {headers, observe: 'response'})
            .pipe(
                catchError((error) => {
                    return this.handleError(error);
                })
            );
    }

    public delete<T>(url: string, headers): Observable<HttpResponse<T>> {
        return this.httpClient.delete<T>(ApiRequestService.API_BASE_DOMAIN + url, {headers, observe: 'response'})
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
