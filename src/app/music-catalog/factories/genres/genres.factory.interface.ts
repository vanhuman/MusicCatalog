import { Observable } from 'rxjs';
import { GenreInterface } from '../../models/genre.model.interface';

export abstract class GenresFactoryInterface {
    public abstract getGenres(page: number): Observable<GenreInterface[]>;
    public abstract searchGenres(keyword: string): GenreInterface[];
}
