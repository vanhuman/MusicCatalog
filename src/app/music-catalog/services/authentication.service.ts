import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of, Subject, Subscription } from 'rxjs';

import { AuthenticateApiResponse } from '../models/api-responses/authenticate-api-response.interface';
import { SessionInterface } from '../models/session.model.interface';
import { Session } from '../models/session.model';
import { AuthenticationServiceInterface } from './authentication.service.interface';
import { ApiRequestServiceInterface } from './api-request.service.interface';
import { UserInterface } from '../models/user.model.interface';
import { User } from '../models/user.model';

export interface AuthenticationResult {
    succes: boolean;
    error?: string;
}

@Injectable()
export class AuthenticationService implements AuthenticationServiceInterface, OnDestroy {
    private validSession: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private session: SessionInterface;
    private user: UserInterface;
    private authorisationErrorSubscription: Subscription;

    public constructor(
        private httpClient: HttpClient,
        private apiRequestService: ApiRequestServiceInterface,
    ) {
        this.authorisationErrorSubscription = this.apiRequestService.monitorAuthorisationError()
            .subscribe((autorisationError) => {
                if (autorisationError) {
                    this.validSession.next(false);
                }
            });
    }

    public ngOnDestroy(): void {
        this.authorisationErrorSubscription.unsubscribe();
    }

    public login(username: string, password: string, forced: boolean = false): Observable<AuthenticationResult> {
        if (this.session && !forced) {
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
        this.apiRequestService.post<AuthenticateApiResponse>(
            '/authenticate',
            body,
            headers
        ).subscribe({
            next: (response) => {
                this.session = new Session(
                    response.body.session.id,
                    response.body.session.token,
                    response.body.session.time_out,
                    response.body.session.user_id,
                );
                this.user = new User(
                    response.body.user.id,
                    response.body.user.username,
                    response.body.user.admin,
                );
                this.validSession.next(true);
                observable.next({succes: true});
            },
            error: (error: HttpErrorResponse) => {
                this.validSession.next(false);
                observable.next({
                    succes: false,
                    error: error.error.message,
                });
            }
        });
        return observable;
    }

    public monitorValidSession(): Observable<boolean> {
        return this.validSession;
    }

    public getToken(): string {
        return this.session.getToken();
    }

    public isAdmin(): boolean {
        return this.user ? this.user.isAdmin() : false;
    }
}
