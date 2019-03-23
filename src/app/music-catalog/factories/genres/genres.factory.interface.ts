import { Observable } from 'rxjs';
import { GenreInterface } from '../../models/genre.model.interface';
import { GenreApiResponse } from '../../models/api-responses/genres-api-response.interface';
import { GenreApiPostData } from '../../models/api-post-data/genre-api-post-data.interface';

export abstract class GenresFactoryInterface {
    public abstract getGenresFromAPI(page: number): Observable<GenreInterface[]>;
    public abstract postGenre(genreApiPostData: GenreApiPostData): Observable<GenreInterface>;
    public abstract searchGenresInCache(keyword: string): GenreInterface[];
    public abstract updateAndGetGenre(genreApiResponse: GenreApiResponse): GenreInterface;
    public abstract matchGenreInCache(value: string): GenreInterface;
}
