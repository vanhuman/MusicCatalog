import { AlbumInterface } from '../models/album.model.interface';
import { Injectable } from '@angular/core';

@Injectable()
export class AlbumsFactoryState {
    public cache: { [id: number]: AlbumInterface } = {};
}
