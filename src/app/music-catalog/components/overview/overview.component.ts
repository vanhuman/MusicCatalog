import { Component } from '@angular/core';
import { AlbumsFactoryInterface } from '../../factories/albums.factory.interface';
import { AlbumInterface } from '../../models/album.model.interface';

@Component({
    selector: 'music-catalog-overview',
    templateUrl: './overview.component.html',
    styleUrls: ['./overview.component.css'],
})
export class OverviewComponent {
    public albums: AlbumInterface[];

    public constructor(
        private albumsFactory: AlbumsFactoryInterface,
    ) {
        this.albumsFactory.getAlbums().subscribe({
            next: (response) => {
                this.albums = response;
                console.log(this.albums);
            },
            error: (error) => {
                //
            }
        });
    }
}
