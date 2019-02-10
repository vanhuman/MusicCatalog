import { AlbumInterface } from '../models/album.model.interface';
import { Observable } from 'rxjs';

export interface AlbumsMetaData {
    totalNumberOfRecords: number;
    currentPage: number;
    pageSize: number;
}

export abstract class AlbumsFactoryInterface {
    public abstract getAlbums(page: number, keywords: string): Observable<AlbumInterface[]>;
    public abstract getAlbumsMetaData(): Observable<AlbumsMetaData>;
}
