import { HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

export abstract class ApiRequestServiceInterface {

    public abstract get<T>(url: string, params: HttpParams): Observable<HttpResponse<T>>;

    public abstract post<T>(url: string, body, headers): Observable<HttpResponse<T>>;

    public abstract monitorAuthorisationError(): Subject<boolean>;
}

