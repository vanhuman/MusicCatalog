import { AlbumInterface } from '../models/album.model.interface';
import { Observable } from 'rxjs';

export abstract class AlbumsFactoryInterface {
    public abstract getAlbums(): Observable<AlbumInterface[]>;
}
