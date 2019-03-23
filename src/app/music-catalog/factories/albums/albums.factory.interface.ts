import { AlbumInterface } from '../../models/album.model.interface';
import { Observable } from 'rxjs';
import { SortDirection, SortField } from '../../components/overview/overview.component';
import { AlbumPostData } from '../../models/api-post-data/album-api-post-data.interface';

export interface AlbumsMetaData {
    totalNumberOfRecords: number;
    currentPage: number;
    pageSize: number;
}

export interface GetAlbumsParams {
    page: number;
    keywords: string;
    sortby: SortField;
    sortdirection: SortDirection;
}

export type ImageSize = 'small' | 'medium' | 'large' | 'extralarge' | 'mega';

export abstract class AlbumsFactoryInterface {
    public abstract getAlbums(getAlbumsParams: GetAlbumsParams): Observable<AlbumInterface[]>;
    public abstract getAlbumsMetaData(): Observable<AlbumsMetaData>;
    public abstract getImagesFromLastfm(album: AlbumInterface): Promise<Map<ImageSize, string>>;
    public abstract putAlbum(albumPostData: AlbumPostData, album: AlbumInterface): Observable<AlbumInterface>;
    public abstract postAlbum(albumPostData: AlbumPostData): Observable<AlbumInterface>;
    public abstract deleteAlbum(album: AlbumInterface): Observable<boolean>;
    public abstract clearThrottleQueue(): void;
}


