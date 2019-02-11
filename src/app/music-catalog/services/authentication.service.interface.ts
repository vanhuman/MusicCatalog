import { Observable } from 'rxjs';
import { AuthenticationResult } from './authentication.service';

export abstract class AuthenticationServiceInterface {

    public abstract login(username: string, password: string): Observable<AuthenticationResult>;

    public abstract authenticate(username: string, password: string): Observable<AuthenticationResult>;

    public abstract getToken(): string;

    public abstract monitorLogin(): Observable<boolean>;
}

