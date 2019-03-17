import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { ArtistInterface } from '../../models/artist.model.interface';
import { HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthenticationServiceInterface } from '../../services/authentication.service.interface';
import { ApiRequestServiceInterface } from '../../services/api-request.service.interface';
import { ArtistsFactoryState } from './artists.factory.state';
import {
    ArtistApiResponse, ArtistApiResponseWrapper, ArtistsApiResponse
} from '../../models/api-responses/artists-api-response.interface';
import { ModalServiceInterface } from '../../services/modal.service.interface';
import { Artist } from '../../models/artist.model';
import { ArtistsFactoryInterface } from './artists.factory.interface';
import { ArtistApiPostData } from '../../models/api-post-data/artist-api-post-data.interface';

@Injectable()
export class ArtistsFactory implements ArtistsFactoryInterface {

    public constructor(
        private authenticationService: AuthenticationServiceInterface,
        private apiRequestService: ApiRequestServiceInterface,
        private state: ArtistsFactoryState,
        private modalService: ModalServiceInterface,
    ) {
        //
    }

    public postArtist(artistApiPostData: ArtistApiPostData): Observable<ArtistInterface> {
        const observable: Subject<ArtistInterface> = new Subject<ArtistInterface>();
        const token = this.authenticationService.getToken();
        const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
        let body = new HttpParams();
        if (artistApiPostData.name) {
            body = body.set('name', artistApiPostData.name);
        }
        this.apiRequestService.post<ArtistApiResponseWrapper>(
            '/artists?token=' + token,
            body,
            headers
        ).subscribe({
            next: (response) => {
                const artistApiResponse: ArtistApiResponse = response.body.artist;
                const artist: ArtistInterface = this.newArtist(artistApiResponse);
                this.state.cache[artist.getId()] = artist;
                observable.next(artist);
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

    public searchArtistsInCache(keyword: string): ArtistInterface[] {
        return this.state.getCacheAsArray()
            .filter((artist) => {
                return artist.getName().toLowerCase().indexOf(keyword.toLowerCase()) !== -1 ||
                    artist.getFullName().toLowerCase().indexOf(keyword.toLowerCase()) !== -1;
            });
    }

    public getArtistsFromAPI(page: number): Observable<ArtistInterface[]> {
        const observable: Subject<ArtistInterface[]> = new Subject<ArtistInterface[]>();
        const token = this.authenticationService.getToken();
        let params = new HttpParams();
        params = params.set('token', token);
        params = params.set('page', page.toString());
        // if the request is for all artists and we have some in cache, return the cache
        if (page === 0 && this.state.getCacheAsArray().length > 0) {
            return of(this.sortArtists(this.state.getCacheAsArray()));
        }
        this.apiRequestService.get<ArtistsApiResponse>('/artists', params).subscribe({
            next: (response) => {
                const artists: ArtistInterface[] = [];
                response.body.artists.forEach((artistApiResponse) => {
                    if (this.state.cache[artistApiResponse.id]) {
                        artists.push(this.updateArtist(this.state.cache[artistApiResponse.id], artistApiResponse));
                    } else {
                        const newArtist = this.newArtist(artistApiResponse);
                        artists.push(newArtist);
                        this.state.cache[newArtist.getId()] = newArtist;
                    }
                });
                observable.next(this.sortArtists(artists));
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

    public getArtistFromAPI(artistId: number): Observable<ArtistInterface> {
        if (this.state.cache[artistId]) {
            return of(this.state.cache[artistId]);
        }
        const observable: Subject<ArtistInterface> = new Subject<ArtistInterface>();
        const token = this.authenticationService.getToken();
        let params = new HttpParams();
        params = params.set('token', token);
        this.apiRequestService.get<ArtistApiResponseWrapper>('/artist/' + artistId, params).subscribe({
            next: (response) => {
                const artistApiResponse = response.body.artist;
                let artist: ArtistInterface;
                if (this.state.cache[artistApiResponse.id]) {
                    artist = this.updateArtist(this.state.cache[artistApiResponse.id], artistApiResponse);
                } else {
                    artist = this.newArtist(artistApiResponse);
                    this.state.cache[artist.getId()] = artist;
                }
                observable.next(artist);
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

    public updateAndGetArtist(artistApiResponse: ArtistApiResponse): ArtistInterface {
        if (this.state.cache[artistApiResponse.id]) {
            this.updateArtist(this.state.cache[artistApiResponse.id], artistApiResponse);
        } else {
            this.state.cache[artistApiResponse.id] = this.newArtist(artistApiResponse);
        }
        return this.state.cache[artistApiResponse.id];
    }

    private sortArtists(artists: ArtistInterface[]): ArtistInterface[] {
        const sortFunc = (artist1: ArtistInterface, artist2: ArtistInterface) => {
            return artist1.getName().toLowerCase() < artist2.getName().toLowerCase() ? -1 : 1;
        };
        return artists.sort(sortFunc);
    }

    private newArtist(artistApiResponse: ArtistApiResponse): ArtistInterface {
        return new Artist(
            artistApiResponse.id,
            artistApiResponse.name,
        );
    }

    private updateArtist(artist: ArtistInterface, artistApiResponse: ArtistApiResponse): ArtistInterface {
        artist.setName(artistApiResponse.name);
        return artist;
    }
}
