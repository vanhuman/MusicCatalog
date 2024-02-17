import { Injectable, OnDestroy, OnInit } from '@angular/core';
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
export class AuthenticationService implements AuthenticationServiceInterface, OnDestroy, OnInit {
    private validSession: BehaviorSubject<boolean> = new BehaviorSubject(false);
    private session: SessionInterface;
    private user: UserInterface;
    private authorisationErrorSubscription: Subscription;

    public constructor(
        private httpClient: HttpClient,
        private apiRequestService: ApiRequestServiceInterface,
    ) {
        this.loginWithSessionStorage();
    }

    public ngOnInit() {
        this.authorisationErrorSubscription = this.apiRequestService.monitorAuthorisationError()
            .subscribe((autorisationError) => {
                if (autorisationError) {
                    this.validSession.next(false);
                    this.logout();
                }
            });
    }

    public ngOnDestroy(): void {
        this.authorisationErrorSubscription.unsubscribe();
    }

    public login(username: string, password: string, forced = false): Observable<AuthenticationResult> {
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
        this.apiRequestService.post<AuthenticateApiResponse>('/authenticate', body, headers)
            .subscribe({
                next: (response) => {
                    this.createSession(response.body);
                    this.createUser(response.body);
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

    public isLoggedIn(): boolean {
        return !!this.user;
    }

    public logout(): void {
        this.user = null;
        this.session = null;
        sessionStorage.removeItem('mc-session');
        sessionStorage.removeItem('mc-user');
    }

    private loginWithSessionStorage(): void {
        let storedSession = sessionStorage.getItem('mc-session');
        let storedUser = sessionStorage.getItem('mc-user');
        if (storedSession && storedUser) {
            storedSession = this.camelCaseToSnakeCase(storedSession);
            storedUser = this.camelCaseToSnakeCase(storedUser);
            const authenticateApiResponse: AuthenticateApiResponse = {
                session: JSON.parse(storedSession),
                user: JSON.parse(storedUser),
            };
            this.createSession(authenticateApiResponse);
            this.createUser(authenticateApiResponse);
            this.validSession.next(true);
        }
    }

    private camelCaseToSnakeCase(value: string): string {
        return value.replace(/([a-z])([A-Z])/g, '$1_$2').toLowerCase();
    }

    private createSession(responseBody: AuthenticateApiResponse): void {
        this.session = new Session(
            responseBody.session.id,
            responseBody.session.token,
            responseBody.session.time_out,
            responseBody.session.user_id,
        );
        sessionStorage.setItem('mc-session', JSON.stringify(this.session));
    }

    private createUser(responseBody: AuthenticateApiResponse): void {
        this.user = new User(
            responseBody.user.id,
            responseBody.user.username,
            responseBody.user.admin,
        );
        sessionStorage.setItem('mc-user', JSON.stringify(this.user));
    }
}
