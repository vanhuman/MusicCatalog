import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthenticateApiResponse } from '../models/authenticate-api-response.model';
import { Observable, of, Subject } from 'rxjs';
import { SessionInterface } from '../models/session.model.interface';
import { Session } from '../models/session.model';
import { ApiRequestService } from './api-request.service';

@Injectable()
export class AuthenticationService {

    private session: SessionInterface;

    public constructor(
        private apiRequestService: ApiRequestService,
    ) {
        //
    }

    public login(): Observable<boolean> {
        if (this.session) {
            return of(true);
        }
        return this.authenticate();
    }

    public authenticate(): Observable<boolean> {
        const observable: Subject<boolean> = new Subject();
        const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
        let body = new HttpParams();
        body = body.set('username', 'robert');
        body = body.set('password', 'ankerput');
        this.apiRequestService.post<AuthenticateApiResponse>(
            '/authenticate',
            body,
            headers
        ).subscribe({
            next: (response) => {
                console.log('Login succesful');
                this.session = new Session(
                    response.body.session.id,
                    response.body.session.token,
                    response.body.session.time_out,
                    response.body.session.user_id
                );
                observable.next(true);
            },
            error: (error: HttpErrorResponse) => {
                console.log(error.error);
                delete this.session;
                observable.next(false);
            }
        });
        return observable;
    }

    public getToken(): string {
        return this.session.getToken();
    }
}
