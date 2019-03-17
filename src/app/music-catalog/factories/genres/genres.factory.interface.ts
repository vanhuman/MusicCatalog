import { Observable } from 'rxjs';
import { GenreInterface } from '../../models/genre.model.interface';
import { GenreApiResponse } from '../../models/api-responses/genres-api-response.interface';

export abstract class GenresFactoryInterface {
    public abstract getGenresFromAPI(page: number): Observable<GenreInterface[]>;
    public abstract searchGenresInCache(keyword: string): GenreInterface[];
    public abstract updateAndGetGenre(genreApiResponse: GenreApiResponse): GenreInterface;
}
