import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthenticationServiceInterface } from '../../services/authentication.service.interface';
import { ApiRequestServiceInterface } from '../../services/api-request.service.interface';
import { GenreInterface } from '../../models/genre.model.interface';
import { GenresFactoryState } from './genres.factory.state';
import {
    GenreApiResponse, GenreApiResponseWrapper, GenresApiResponse
} from '../../models/api-responses/genres-api-response.interface';
import { ModalServiceInterface } from '../../services/modal.service.interface';
import { Genre } from '../../models/genre.model';
import { GenresFactoryInterface } from './genres.factory.interface';
import { GenreApiPostData } from '../../models/api-post-data/genre-api-post-data.interface';
import { AlbumInterface } from '../../models/album.model.interface';

@Injectable()
export class GenresFactory implements GenresFactoryInterface {

    public constructor(
        private authenticationService: AuthenticationServiceInterface,
        private apiRequestService: ApiRequestServiceInterface,
        private state: GenresFactoryState,
        private modalService: ModalServiceInterface,
    ) {
        //
    }

    public getGenresFromAPI(page: number): Observable<GenreInterface[]> {
        const observable: Subject<GenreInterface[]> = new Subject<GenreInterface[]>();
        const token = this.authenticationService.getToken();
        let params = new HttpParams();
        params = params.set('token', token);
        params = params.set('page', page.toString());
        if (page === 0) {
            if (this.state.retrievedAllGenres) {
                return of(this.sortGenres(this.state.getCacheAsArray()));
            }
            this.state.retrievedAllGenres = true;
        }
        this.apiRequestService.get<GenresApiResponse>('/genres', params).subscribe({
            next: (response) => {
                const genres: GenreInterface[] = [];
                response.body.genres.forEach((genreApiResponse) => {
                    if (this.state.cache[genreApiResponse.id]) {
                        genres.push(this.updateGenre(this.state.cache[genreApiResponse.id], genreApiResponse));
                    } else {
                        const newGenre = this.newGenre(genreApiResponse);
                        genres.push(newGenre);
                        this.state.cache[newGenre.getId()] = newGenre;
                    }
                });
                observable.next(this.sortGenres(genres));
            },
            error: (error: HttpErrorResponse) => {
                console.log(error);
                this.modalService.getModal('modal1')
                    .setErrorMessage(error.error)
                    .open();
                observable.error([]);
            }
        });
        return observable;
    }

    public postGenre(genreApiPostData: GenreApiPostData): Observable<GenreInterface> {
        const observable: Subject<GenreInterface> = new Subject<GenreInterface>();
        const token = this.authenticationService.getToken();
        const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
        let body = new HttpParams();
        if (genreApiPostData.description) {
            body = body.set('description', genreApiPostData.description);
        }
        if (genreApiPostData.notes) {
            body = body.set('notes', genreApiPostData.notes);
        }
        this.apiRequestService.post<GenreApiResponseWrapper>(
            '/genres?token=' + token,
            body,
            headers
        ).subscribe({
            next: (response) => {
                const genreApiResponse: GenreApiResponse = response.body.genre;
                const genre: GenreInterface = this.newGenre(genreApiResponse);
                this.state.cache[genre.getId()] = genre;
                observable.next(genre);
            },
            error: (error: HttpErrorResponse) => {
                this.modalService.getModal('modal1')
                    .setErrorMessage(error.error)
                    .open();
                observable.error([]);
            }
        });
        return observable;
    }

    public putGenre(genre: GenreInterface, genreApiPostData: GenreApiPostData): Observable<GenreInterface> {
        const observable: Subject<GenreInterface> = new Subject<GenreInterface>();
        const token = this.authenticationService.getToken();
        const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
        let body = new HttpParams();
        if (genreApiPostData.description) {
            body = body.set('description', genreApiPostData.description);
        }
        this.apiRequestService.put<GenreApiResponseWrapper>(
            '/genres/' + genre.getId() + '?token=' + token,
            body,
            headers
        ).subscribe({
            next: (response) => {
                const genreApiResponse: GenreApiResponse = response.body.genre;
                this.state.cache[genre.getId()] = this.updateGenre(genre, genreApiResponse);
                observable.next(genre);
            },
            error: (error: HttpErrorResponse) => {
                this.modalService.getModal('modal1')
                    .setErrorMessage(error.error)
                    .open();
                observable.error([]);
            }
        });
        return observable;
    }

    public searchGenresInCache(keyword: string): GenreInterface[] {
        return this.state.getCacheAsArray()
            .filter((genre) => {
                return genre.getDescription().toLowerCase().indexOf(keyword.toLowerCase()) !== -1;
            });
    }

    public matchGenreInCache(value: string): GenreInterface {
        return this.state.getCacheAsArray()
            .find((genre) => {
                return genre.getDescription().toLowerCase() === value.toLowerCase();
            });
    }

    public updateAndGetGenre(genreApiResponse: GenreApiResponse): GenreInterface {
        if (this.state.cache[genreApiResponse.id]) {
            this.updateGenre(this.state.cache[genreApiResponse.id], genreApiResponse);
        } else {
            this.state.cache[genreApiResponse.id] = this.newGenre(genreApiResponse);
        }
        return this.state.cache[genreApiResponse.id];
    }

    public getGenreIdFromValue(album: AlbumInterface, value: string, allReferences: boolean = false): Promise<number> {
        return new Promise((resolve) => {
            let genre: GenreInterface;
            if (!value) {
                resolve(null);
            }
            if (!album || !album.getGenre() || album.getGenre().getName() !== value) {
                genre = this.matchGenreInCache(value);
                if (genre) {
                    resolve(genre.getId());
                } else {
                    if (album && album.getGenre() && allReferences) {
                        this.putGenre(album.getGenre(), {description: value}).subscribe({
                            next: () => {
                                resolve(album.getGenre().getId());
                            },
                        });
                    } else {
                        this.postGenre({description: value}).subscribe({
                            next: (newGenre) => {
                                resolve(newGenre.getId());
                            },
                        });
                    }
                }
            } else {
                resolve(album.getGenre().getId());
            }
        });
    }

    private sortGenres(genres: GenreInterface[]): GenreInterface[] {
        const sortFunc = (genre1: GenreInterface, genre2: GenreInterface) => {
            return genre1.getName().toLowerCase() < genre2.getName().toLowerCase() ? -1 : 1;
        };
        return genres.sort(sortFunc);
    }

    private newGenre(genreApiResponse: GenreApiResponse): GenreInterface {
        return new Genre(
            genreApiResponse.id,
            genreApiResponse.description,
            genreApiResponse.notes,
        );
    }

    private updateGenre(genre: GenreInterface, genreApiResponse: GenreApiResponse): GenreInterface {
        genre.setDescription(genreApiResponse.description);
        genre.setNotes(genreApiResponse.notes);
        return genre;
    }
}
