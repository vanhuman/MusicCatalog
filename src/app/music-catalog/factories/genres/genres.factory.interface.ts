import { Observable } from 'rxjs';
import { GenreInterface } from '../../models/genre.model.interface';
import { GenreApiResponse } from '../../models/api-responses/genres-api-response.interface';
import { GenreApiPostData } from '../../models/api-post-data/genre-api-post-data.interface';
import { AlbumInterface } from '../../models/album.model.interface';

export abstract class GenresFactoryInterface {
    public abstract getGenresFromAPI(page?: number, forced?: boolean): Observable<GenreInterface[]>;
    public abstract postGenre(genreApiPostData: GenreApiPostData): Observable<GenreInterface>;
    public abstract putGenre(genre: GenreInterface, genreApiPostData: GenreApiPostData): Observable<GenreInterface>;
    public abstract searchGenresInCache(keyword: string): GenreInterface[];
    public abstract updateAndGetGenre(genreApiResponse: GenreApiResponse): GenreInterface;
    public abstract matchGenreInCache(value: string): GenreInterface;
    public abstract getGenreIdFromValue(album: AlbumInterface, value: string, allReferences: boolean): Promise<number>;
}
