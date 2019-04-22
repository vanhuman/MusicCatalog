import { Observable } from 'rxjs';
import { ArtistInterface } from '../../models/artist.model.interface';
import { ArtistApiPostData } from '../../models/api-post-data/artist-api-post-data.interface';
import { ArtistApiResponse } from '../../models/api-responses/artists-api-response.interface';
import { AlbumInterface } from '../../models/album.model.interface';

export abstract class ArtistsFactoryInterface {
    public abstract getArtistsFromAPI(page?: number, forced?: boolean): Observable<ArtistInterface[]>;
    public abstract getArtistFromAPI(artistId: number): Observable<ArtistInterface>;
    public abstract postArtist(artistApiPostData: ArtistApiPostData): Observable<ArtistInterface>;
    public abstract putArtist(artist: ArtistInterface, artistApiPostData: ArtistApiPostData): Observable<ArtistInterface>;
    public abstract searchArtistsInCache(keyword: string): ArtistInterface[];
    public abstract updateAndGetArtist(artistApiResponse: ArtistApiResponse): ArtistInterface;
    public abstract matchArtistInCache(value: string): ArtistInterface;
    public abstract getArtistIdFromValue(album: AlbumInterface, value: string, allReferences: boolean): Promise<number>;
}



