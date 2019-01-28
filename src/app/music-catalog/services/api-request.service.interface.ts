import { HttpParams, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ApiRequestServiceInterface {
    get<T>(url: string, params: HttpParams): Observable<HttpResponse<T>>;

    post<T>(url: string, body, headers): Observable<HttpResponse<T>>;
}
