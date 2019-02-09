import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';

import { AuthenticateApiResponse } from '../models/api-responses/authenticate-api-response.model';
import { SessionInterface } from '../models/session.model.interface';
import { Session } from '../models/session.model';
import { AuthenticationServiceInterface } from './authentication.service.interface';
import { ApiRequestService } from './api-request.service';

export interface AuthenticationResult {
    succes: boolean;
    error?: string;
}

@Injectable()
export class AuthenticationService implements AuthenticationServiceInterface {
    private isLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private session: SessionInterface;

    public constructor(
        private httpClient: HttpClient,
    ) {
        //
    }

    public login(username: string, password: string): Observable<AuthenticationResult> {
        if (this.session) {
            return of({succes: true});
        }
        return this.authenticate(username, password);
    }

    public authenticate(username: string, password: string): Observable<AuthenticationResult> {
        const observable: Subject<AuthenticationResult> = new Subject();
        const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
        let body = new HttpParams();
        body = body.set('username', username);
        body = body.set('password', password);
        this.httpClient.post<AuthenticateApiResponse>(
            ApiRequestService.API_BASE_DOMAIN + '/authenticate',
            body,
            {headers}
        ).subscribe({
            next: (response) => {
                this.session = new Session(
                    response.session.id,
                    response.session.token,
                    response.session.time_out,
                    response.session.user_id
                );
                this.isLoggedIn.next(true);
                observable.next({succes: true});
            },
            error: (error: HttpErrorResponse) => {
                this.removeSession();
                this.isLoggedIn.next(false);
                observable.next({
                    succes: false,
                    error: error.error.message,
                });
            }
        });
        return observable;
    }

    public monitorLogin(): Observable<boolean> {
        return this.isLoggedIn;
    }

    public logOut(): void {
        this.removeSession();
        this.isLoggedIn.next(false);
    }

    public getToken(): string {
        return this.session.getToken();
    }

    private removeSession(): void {
        delete this.session;
    }
}
