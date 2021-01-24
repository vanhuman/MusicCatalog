import { Injectable } from '@angular/core';
import { ArtistInterface } from '../../models/artist.model.interface';

@Injectable()
export class ArtistsFactoryState {
    public cache: { [id: number]: ArtistInterface } = {};
    public retrievedAllArtists = false;

    public getCacheAsArray(): ArtistInterface[] {
        return Object.keys(this.cache).map(key => this.cache[key]);
    }
}
