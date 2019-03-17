import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { AuthenticationServiceInterface } from '../../services/authentication.service.interface';
import { ApiRequestServiceInterface } from '../../services/api-request.service.interface';
import { GenreInterface } from '../../models/genre.model.interface';
import { GenresFactoryState } from './genres.factory.state';
import { GenreApiResponse, GenresApiResponse } from '../../models/api-responses/genres-api-response.interface';
import { ModalServiceInterface } from '../../services/modal.service.interface';
import { Genre } from '../../models/genre.model';
import { GenresFactoryInterface } from './genres.factory.interface';

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

    public searchGenresInCache(keyword: string): GenreInterface[] {
        return this.state.getCacheAsArray()
            .filter((genre) => {
                return genre.getDescription().toLowerCase().indexOf(keyword.toLowerCase()) !== -1;
            });
    }

    public getGenresFromAPI(page: number): Observable<GenreInterface[]> {
        const observable: Subject<GenreInterface[]> = new Subject<GenreInterface[]>();
        const token = this.authenticationService.getToken();
        let params = new HttpParams();
        params = params.set('token', token);
        params = params.set('page', page.toString());
        // if the request is for all genres and we have some in cache, return the cache
        if (page === 0 && this.state.getCacheAsArray().length > 0) {
            return of(this.sortGenres(this.state.getCacheAsArray()));
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
                this.modalService.getModal('message-modal')
                    .setMessage(error.error.message)
                    .open();
                observable.error([]);
            }
        });
        return observable;
    }

    public updateAndGetGenre(genreApiResponse: GenreApiResponse): GenreInterface {
        if (this.state.cache[genreApiResponse.id]) {
            this.updateGenre(this.state.cache[genreApiResponse.id], genreApiResponse);
        } else {
            this.state.cache[genreApiResponse.id] = this.newGenre(genreApiResponse);
        }
        return this.state.cache[genreApiResponse.id];
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
