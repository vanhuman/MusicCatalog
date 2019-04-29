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
import { AlbumsFactoryState } from './albums.factory.state';
import { AlbumPostData } from '../../models/api-post-data/album-api-post-data.interface';
import { ArtistsFactoryInterface } from '../artists/artists.factory.interface';
import { FormatsFactoryInterface } from '../formats/formats.factory.interface';
import { GenresFactoryInterface } from '../genres/genres.factory.interface';
import { LabelsFactoryInterface } from '../labels/labels.factory.interface';

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
        private artistsFactory: ArtistsFactoryInterface,
        private formatsFactory: FormatsFactoryInterface,
        private genresFactory: GenresFactoryInterface,
        private labelsFactory: LabelsFactoryInterface,
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
                this.errorHandling(error, observable);
            }
        });
        return observable;
    }

    public getImagesFromLastfm(album: AlbumInterface): Promise<Map<ImageSize, string>> {
        return new Promise<Map<ImageSize, string>>((resolve, reject) => {
            const artistName = album.getArtist().getFullName();
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

    public clearThrottleQueue(): void {
        this.apiRequestService.clearHttpQueue();
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
                this.errorHandling(error, observable);
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
            '/albums?token=' + token,
            body,
            headers
        ).subscribe({
            next: (response) => {
                const album = this.newAlbum(response.body.album);
                observable.next(album);
                observable.complete();
            },
            error: (error: HttpErrorResponse) => {
                this.errorHandling(error, observable);
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
                album.setDeleted(true);
                observable.next(true);
                observable.complete();
            },
            error: (error: HttpErrorResponse) => {
                this.errorHandling(error, observable);
            }
        });
        return observable;
    }

    private errorHandling(error: HttpErrorResponse, observable: Subject<any>): void {
        if (error.status === 401) {
            if (this.authenticationService.isAdmin()) {
                error.error.message = 'Your session has expired. You are now in a read-only session.';
            } else {
                error.error.message = 'Your session was expired. But do not worry: we have retrieved a new session for you.';
            }
        }
        if (this.modalService.getModal('modal1').isOpen()) {
            this.modalService.getModal('modal1').close();
        }
        this.modalService.getModal('modal1')
            .setErrorMessage(error.error)
            .open();
        observable.error(false);
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
        if (albumPostData.image_fetch_timestamp) {
            body = body.set('image_fetch_timestamp', albumPostData.image_fetch_timestamp);
        }
        if (albumPostData.artist_id) {
            body = body.set('artist_id', albumPostData.artist_id.toString());
        }
        if (albumPostData.format_id) {
            body = body.set('format_id', albumPostData.format_id.toString());
        }
        if (albumPostData.label_id != null) {
            body = body.set('label_id', albumPostData.label_id.toString());
        }
        if (albumPostData.genre_id != null) {
            body = body.set('genre_id', albumPostData.genre_id.toString());
        }
        return body;
    }

    private cleanUp(value: string, artistName: string = null): string {
        let returnValue = value;
        // replace s/t with artist name
        if (value.trim() === 's/t') {
            returnValue = artistName;
        }
        return returnValue.trim();
    }

    private newAlbum(albumApiResponse: AlbumApiResponse): AlbumInterface {
        let artist;
        if (albumApiResponse.artist) {
            artist = this.artistsFactory.updateAndGetArtist(albumApiResponse.artist);
        }
        let format;
        if (albumApiResponse.format) {
            format = this.formatsFactory.updateAndGetFormat(albumApiResponse.format);
        }
        let label;
        if (albumApiResponse.label) {
            label = this.labelsFactory.updateAndGetLabel(albumApiResponse.label);
        }
        let genre;
        if (albumApiResponse.genre) {
            genre = this.genresFactory.updateAndGetGenre(albumApiResponse.genre);
        }
        return new Album(
            albumApiResponse.id,
            albumApiResponse.title,
            albumApiResponse.year,
            DateUtility.parseDate(albumApiResponse.date_added),
            albumApiResponse.notes,
            albumApiResponse.image_thumb,
            albumApiResponse.image,
            DateUtility.parseDate(albumApiResponse.image_fetch_timestamp),
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
        album.setImageFetchTimestamp(DateUtility.parseDate(albumApiResponse.image_fetch_timestamp));
        album.setImage(albumApiResponse.image);
        if (albumApiResponse.artist) {
            album.setArtist(this.artistsFactory.updateAndGetArtist(albumApiResponse.artist));
        }
        if (albumApiResponse.format) {
            album.setFormat(this.formatsFactory.updateAndGetFormat(albumApiResponse.format));
        }
        if (albumApiResponse.label) {
            album.setLabel(this.labelsFactory.updateAndGetLabel(albumApiResponse.label));
        } else {
            album.setLabel(null);
        }
        if (albumApiResponse.genre) {
            album.setGenre(this.genresFactory.updateAndGetGenre(albumApiResponse.genre));
        } else {
            album.setGenre(null);
        }
        return album;
    }
}
