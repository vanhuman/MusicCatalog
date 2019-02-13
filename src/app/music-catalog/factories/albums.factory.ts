import { AlbumsFactoryInterface, AlbumsMetaData, GetAlbumsParams, ImageSize } from './albums.factory.interface';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

import { DateUtility } from '../utilities/date.utility';
import { AlbumApiResponse, AlbumsApiResponse } from '../models/api-responses/albums-api-response.model';
import { AuthenticationServiceInterface } from '../services/authentication.service.interface';
import { ApiRequestServiceInterface } from '../services/api-request.service.interface';
import { ModalServiceInterface } from '../services/modal.service.interface';
import { AlbumInterface } from '../models/album.model.interface';
import { Album } from '../models/album.model';
import { Artist } from '../models/artist.model';
import { Label } from '../models/label.model';
import { Genre } from '../models/genre.model';
import { Format } from '../models/format.model';


interface LastfmAlbumImage {
    '#text': string;
    size: string;
}

interface LastfmAlbumInfo {
    album: {
        image: LastfmAlbumImage[],
    };
}

@Injectable()
export class AlbumsFactory implements AlbumsFactoryInterface {
    public albumsMetaData: Subject<AlbumsMetaData> = new Subject();

    public constructor(
        private authenticationService: AuthenticationServiceInterface,
        private apiRequestService: ApiRequestServiceInterface,
        private modalService: ModalServiceInterface,
        private httpClient: HttpClient,
    ) {
        //
    }

    public getAlbums(getAlbumsParams: GetAlbumsParams): Observable<AlbumInterface[]> {
        const observable: Subject<AlbumInterface[]> = new Subject<AlbumInterface[]>();
        const token = this.authenticationService.getToken();
        let params = new HttpParams();
        params = params.set('token', token);
        params = params.set('page', getAlbumsParams.page.toString());
        params = params.set('keywords', getAlbumsParams.keywords);
        params = params.set('sortby', getAlbumsParams.sortby);
        params = params.set('sortdirection', getAlbumsParams.sortdirection);
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
                // if ((<ErrorResponse>error.error).code !== errorCode.authorisation) {
                this.modalService.getModal('message-modal')
                    .setMessage(error.error.message)
                    .open();
                // }
                observable.error([]);
            }
        });
        return observable;
    }

    public getImageFromLastfm(album: AlbumInterface): Promise<Map<ImageSize, string>> {
        return new Promise<Map<ImageSize, string>>((resolve, reject) => {
            let params = new HttpParams();
            params = params.set('method', 'album.getinfo');
            params = params.set('api_key', '7582eb9c2d8036e2b57c1ce973467d14');
            params = params.set('artist', album.getArtist().getFullName().trim());
            params = params.set('album', album.getTitle());
            params = params.set('format', 'json');
            const url = 'https://ws.audioscrobbler.com/2.0/';
            this.httpClient.get<LastfmAlbumInfo>(url, {params}).subscribe((result) => {
                if (result.album) {
                    const imageMap: Map<ImageSize, string> = new Map<ImageSize, string>();
                    const images = result.album.image;
                    images.forEach((img) => {
                        imageMap.set(<ImageSize>img.size, img['#text']);
                    });
                    resolve(imageMap);
                } else {
                    reject();
                }
            });
        });
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
