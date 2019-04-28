import { Observable } from 'rxjs';
import { AuthenticationResult } from './authentication.service';

export abstract class AuthenticationServiceInterface {
    public abstract login(username: string, password: string, forced?: boolean): Observable<AuthenticationResult>;
    public abstract authenticate(username: string, password: string): Observable<AuthenticationResult>;
    public abstract getToken(): string;
    public abstract monitorValidSession(): Observable<boolean>;
    public abstract isAdmin(): boolean;
}

