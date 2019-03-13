import { Injectable } from '@angular/core';
import { GenreInterface } from '../../models/genre.model.interface';

@Injectable()
export class GenresFactoryState {
    public cache: { [id: number]: GenreInterface } = {};

    public getCacheAsArray(): GenreInterface[] {
        return Object.keys(this.cache).map(key => this.cache[key]);
    }
}
