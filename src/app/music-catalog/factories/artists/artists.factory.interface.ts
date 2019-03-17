import { Observable } from 'rxjs';
import { ArtistInterface } from '../../models/artist.model.interface';
import { ArtistApiPostData } from '../../models/api-post-data/artist-api-post-data.interface';
import { ArtistApiResponse } from '../../models/api-responses/artists-api-response.interface';

export abstract class ArtistsFactoryInterface {
    public abstract getArtistsFromAPI(page: number): Observable<ArtistInterface[]>;
    public abstract getArtistFromAPI(artistId: number): Observable<ArtistInterface>;
    public abstract postArtist(artistApiPostData: ArtistApiPostData): Observable<ArtistInterface>;
    public abstract searchArtistsInCache(keyword: string): ArtistInterface[];
    public abstract updateAndGetArtist(artistApiResponse: ArtistApiResponse): ArtistInterface;
}



