import { AlbumsFactoryInterface, AlbumsMetaData, GetAlbumsParams, ImageSize } from './albums.factory.interface';
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';

import { DateUtility } from '../../utilities/date.utility';
import {
    AlbumApiResponse, AlbumApiResponseWrapper, AlbumsApiResponse
} from '../../models/api-responses/albums-api-response.interface';
import { AuthenticationServiceInterface } from '../../services/authentication.service.interface';
import { ApiRequestServiceInterface } from '../../services/api-request.service.interface';
import { ModalServiceInterface } from '../../services/modal.service.interface';
import { AlbumInterface } from '../../models/album.model.interface';
import { Album } from '../../models/album.model';
import { Artist } from '../../models/artist.model';
import { Label } from '../../models/label.model';
import { Genre } from '../../models/genre.model';
import { Format } from '../../models/format.model';
import { AlbumsFactoryState } from './albums.factory.state';
import { AlbumPostData } from '../../models/api-post-data/album-api-post-data.interface';

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
        private state: AlbumsFactoryState,
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
                const albums: AlbumInterface[] = [];
                this.albumsMetaData.next({
                    totalNumberOfRecords: response.body.pagination.total_number_of_records,
                    currentPage: response.body.pagination.page,
                    pageSize: response.body.pagination.page_size,
                });
                response.body.albums.forEach((albumApiResponse) => {
                    if (this.state.cache[albumApiResponse.id]) {
                        albums.push(this.updateAlbum(this.state.cache[albumApiResponse.id], albumApiResponse));
                    } else {
                        const newAlbum = this.newAlbum(albumApiResponse);
                        albums.push(newAlbum);
                        this.state.cache[newAlbum.getId()] = newAlbum;
                    }
                });
                observable.next(albums);
            },
            error: (error: HttpErrorResponse) => {
                this.modalService.getModal('message-modal')
                    .setMessage(error.error.message)
                    .open();
                observable.error([]);
            }
        });
        return observable;
    }

    public getImagesFromLastfm(album: AlbumInterface): Promise<Map<ImageSize, string>> {
        return new Promise<Map<ImageSize, string>>((resolve, reject) => {
            const artistName = this.cleanUp(album.getArtist().getFullName());
            const title = this.cleanUp(album.getTitle(), album.getArtist().getFullName());
            let params = new HttpParams();
            params = params.set('method', 'album.getinfo');
            params = params.set('api_key', '7582eb9c2d8036e2b57c1ce973467d14');
            params = params.set('artist', artistName);
            params = params.set('album', title);
            params = params.set('format', 'json');
            const url = 'https://ws.audioscrobbler.com/2.0/';
            this.apiRequestService.getThrottled<LastfmAlbumInfo>(url, params, true)
                .subscribe({
                    next: (result) => {
                        if (result.body && result.body.album && result.body.album.image) {
                            const imageMap: Map<ImageSize, string> = new Map<ImageSize, string>();
                            const images = result.body.album.image;
                            images.forEach((img) => {
                                imageMap.set(<ImageSize>img.size, img['#text']);
                            });
                            resolve(imageMap);
                        } else {
                            reject();
                        }
                    },
                    error: (error) => {
                        console.log(error);
                    }
                });
        });
    }

    public getAlbumsMetaData(): Observable<AlbumsMetaData> {
        return this.albumsMetaData;
    }

    public putAlbum(albumPostData: AlbumPostData, album: AlbumInterface): Observable<AlbumInterface> {
        const observable: Subject<AlbumInterface> = new Subject();
        const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
        const body = this.getHttpParams(albumPostData);
        const token = this.authenticationService.getToken();
        this.apiRequestService.put<AlbumApiResponseWrapper>(
            '/albums/' + album.getId() + '?token=' + token,
            body,
            headers
        ).subscribe({
            next: (response) => {
                this.updateAlbum(album, response.body.album);
                observable.next(album);
                observable.complete();
            },
            error: (error: HttpErrorResponse) => {
                this.modalService.getModal('message-modal')
                    .setMessage(error.error.message)
                    .open();
                observable.error([]);
            }
        });
        return observable;
    }

    public postAlbum(albumPostData: AlbumPostData): Observable<AlbumInterface> {
        const observable: Subject<AlbumInterface> = new Subject();
        const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
        const body = this.getHttpParams(albumPostData);
        const token = this.authenticationService.getToken();
        this.apiRequestService.post<AlbumApiResponseWrapper>(
            '/albums' + '?token=' + token,
            body,
            headers
        ).subscribe({
            next: (response) => {
                const album = this.newAlbum(response.body.album);
                observable.next(album);
                observable.complete();
            },
            error: (error: HttpErrorResponse) => {
                this.modalService.getModal('message-modal')
                    .setMessage(error.error.message)
                    .open();
                observable.error([]);
            }
        });
        return observable;
    }

    public deleteAlbum(album: AlbumInterface): Observable<boolean> {
        const observable: Subject<boolean> = new Subject();
        const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
        const token = this.authenticationService.getToken();
        this.apiRequestService.delete<AlbumApiResponseWrapper>(
            '/albums/' + album.getId() + '?token=' + token,
            headers
        ).subscribe({
            next: () => {
                observable.next(true);
                observable.complete();
            },
            error: (error: HttpErrorResponse) => {
                this.modalService.getModal('message-modal')
                    .setMessage(error.error.message)
                    .open();
                observable.error(false);
            }
        });
        return observable;
    }

    private getHttpParams(albumPostData: AlbumPostData): HttpParams {
        let body = new HttpParams();
        if (albumPostData.title) {
            body = body.set('title', albumPostData.title);
        }
        if (albumPostData.year) {
            body = body.set('year', albumPostData.year.toString());
        }
        if (albumPostData.notes) {
            body = body.set('notes', albumPostData.notes);
        }
        if (albumPostData.image_thumb) {
            body = body.set('image_thumb', albumPostData.image_thumb);
        }
        if (albumPostData.image) {
            body = body.set('image', albumPostData.image);
        }
        if (albumPostData.artist_id) {
            body = body.set('artist_id', albumPostData.artist_id.toString());
        }
        if (albumPostData.format_id) {
            body = body.set('format_id', albumPostData.format_id.toString());
        }
        if (albumPostData.label_id) {
            body = body.set('label_id', albumPostData.label_id.toString());
        }
        if (albumPostData.genre_id) {
            body = body.set('genre_id', albumPostData.genre_id.toString());
        }
        return body;
    }

    private cleanUp(value: string, artistName: string = null): string {
        let returnValue = value;

        // remove brackets
        if (value.indexOf('(') !== -1 && value.indexOf(')') !== -1) {
            const start = value.indexOf('(');
            const end = value.indexOf(')');
            returnValue = value.substring(0, start) + value.substring(end + 1);
        }

        // replace s/t with artist name
        if (artistName && value.trim() === 's/t') {
            returnValue = artistName;
        }

        // remove entries separated by /
        returnValue = returnValue.split('/')[0];

        return returnValue.trim();
    }

    private newAlbum(albumApiResponse: AlbumApiResponse): AlbumInterface {
        let artist;
        if (albumApiResponse.artist) {
            artist = new Artist(
                albumApiResponse.artist.id,
                albumApiResponse.artist.name,
            );
        }
        let format;
        if (albumApiResponse.format) {
            format = new Format(
                albumApiResponse.format.id,
                albumApiResponse.format.name,
                albumApiResponse.format.description,
            );
        }
        let label;
        if (albumApiResponse.label) {
            label = new Label(
                albumApiResponse.label.id,
                albumApiResponse.label.name,
            );
        }
        let genre;
        if (albumApiResponse.genre) {
            genre = new Genre(
                albumApiResponse.genre.id,
                albumApiResponse.genre.description,
                albumApiResponse.genre.notes,
            );
        }
        return new Album(
            albumApiResponse.id,
            albumApiResponse.title,
            albumApiResponse.year,
            DateUtility.parseDate(albumApiResponse.date_added),
            albumApiResponse.notes,
            albumApiResponse.image_thumb,
            albumApiResponse.image,
            artist,
            format,
            label,
            genre
        );
    }

    private updateAlbum(album: AlbumInterface, albumApiResponse: AlbumApiResponse): AlbumInterface {
        album.setTitle(albumApiResponse.title);
        album.setYear(albumApiResponse.year);
        album.setDateAdded(DateUtility.parseDate(albumApiResponse.date_added));
        album.setNotes(albumApiResponse.notes);
        album.setImageThumb(albumApiResponse.image_thumb);
        album.setImage(albumApiResponse.image);
        album.getArtist().setName(albumApiResponse.artist.name);
        album.getFormat().setName(albumApiResponse.format.name);
        album.getFormat().setDescription(albumApiResponse.format.description);
        if (album.getLabel()) {
            album.getLabel().setName(albumApiResponse.label.name);
        }
        if (album.getGenre()) {
            album.getGenre().setDescription(albumApiResponse.genre.description);
            album.getGenre().setNotes(albumApiResponse.genre.notes);
        }
        return album;
    }
}
