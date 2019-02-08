import { AlbumsFactoryInterface, AlbumsMetaData } from './albums.factory.interface';
import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { AlbumApiResponse, AlbumsApiResponse } from '../models/api-responses/albums-api-response.model';
import { AuthenticationServiceInterface } from '../services/authentication.service.interface';
import { ApiRequestServiceInterface } from '../services/api-request.service.interface';
import { ModalServiceInterface } from '../services/modal.service.interface';
import { Observable, Subject } from 'rxjs';
import { AlbumInterface } from '../models/album.model.interface';
import { Album } from '../models/album.model';
import { Artist } from '../models/artist.model';
import { Label } from '../models/label.model';
import { Genre } from '../models/genre.model';
import { DateUtility } from '../utilities/date.utility';
import { Format } from '../models/format.model';
import { errorCode, ErrorResponse } from '../models/api-responses/error-api-response.model';

@Injectable()
export class AlbumsFactory implements AlbumsFactoryInterface {
    public albumsMetaData: Subject<AlbumsMetaData> = new Subject();

    public constructor(
        private authenticationService: AuthenticationServiceInterface,
        private apiRequestService: ApiRequestServiceInterface,
        private modalService: ModalServiceInterface,
    ) {
        //
    }

    public getAlbums(page: number = 1): Observable<AlbumInterface[]> {
        const observable: Subject<AlbumInterface[]> = new Subject<AlbumInterface[]>();
        const token = this.authenticationService.getToken();
        let params = new HttpParams();
        params = params.set('token', token);
        params = params.set('page', page.toString());
        this.apiRequestService.get<AlbumsApiResponse>('/albums', params).subscribe({
            next: (response) => {
                const albums: Album[] = [];
                this.albumsMetaData.next({
                    totalNumberOfRecords: response.body.pagination.total_number_of_records,
                    currentPage: response.body.pagination.page,
                    pageSize: response.body.pagination.page_size,
                });
                response.body.albums.forEach((albumApiResponse) => {
                    albums.push(this.newAlbum(albumApiResponse));
                });
                observable.next(albums);
            },
            error: (error: HttpErrorResponse) => {
                if ((<ErrorResponse>error.error).type === 'ERROR'
                    && (<ErrorResponse>error.error).reference === 'AuthenticationController') {
                    observable.error(errorCode.authorisation);
                } else {
                    this.modalService.getModal('message-modal')
                        .setMessage(error.error.message)
                        .open();
                    observable.error(errorCode.unknown);
                }
            }
        });
        return observable;
    }

    public getAlbumsMetaData(): Observable<AlbumsMetaData> {
        return this.albumsMetaData;
    }

    private newAlbum(albumApiResponse: AlbumApiResponse): Album {
        return new Album(
            albumApiResponse.id,
            albumApiResponse.title,
            albumApiResponse.year,
            DateUtility.parseDate(albumApiResponse.date_added),
            albumApiResponse.notes,
            new Artist(
                albumApiResponse.artist.id,
                albumApiResponse.artist.name,
            ),
            new Format(
                albumApiResponse.format.id,
                albumApiResponse.format.name,
                albumApiResponse.format.description,
            ),
            new Label(
                albumApiResponse.label.id,
                albumApiResponse.label.name,
            ),
            new Genre(
                albumApiResponse.genre.id,
                albumApiResponse.genre.description,
                albumApiResponse.genre.notes,
            )
        );
    }
}
