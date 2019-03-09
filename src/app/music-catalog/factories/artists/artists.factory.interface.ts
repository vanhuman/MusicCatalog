import { Observable } from 'rxjs';
import { ArtistInterface } from '../../models/artist.model.interface';

export abstract class ArtistsFactoryInterface {
    public abstract getArtists(page: number): Observable<ArtistInterface[]>;

    public abstract searchArtists(keyword: string): ArtistInterface[];
}



