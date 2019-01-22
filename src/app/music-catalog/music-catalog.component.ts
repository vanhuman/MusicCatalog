import { Component } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthenticateApiResponse } from './models/authenticate-api-response.model';

@Component({
    selector: 'app-root',
    templateUrl: './music-catalog.component.html',
    styleUrls: ['./music-catalog.component.css'],
})
export class MusicCatalogComponent {
    public title = 'Sutton Music Catalog';
    private token: string;

    public constructor(
        httpClient: HttpClient,
    ) {
        const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
        let body = new HttpParams();
        body = body.set('username', 'robert');
        body = body.set('password', 'ankerput');
        httpClient.post<AuthenticateApiResponse>(
            'http://moses.test/api/authenticate',
            body,
            {headers}
        ).subscribe({
            next: (response) => {
                this.token = response.session.token;
                let params = new HttpParams();
                params = params.set('token', this.token);
                httpClient.get('http://moses.test/api/albums/33', { params }).subscribe((resp) => {
                    console.log(resp);
                });
            },
            error: (error: HttpErrorResponse) => {
                console.log(error.error);
            }
        });
    }
}