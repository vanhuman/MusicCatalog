import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AlbumsFactoryInterface } from '../../factories/albums.factory.interface';
import { AlbumsMetaData } from '../../factories/albums.factory.interface';

@Component({
    selector: 'music-catalog-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
    public title = 'Sutton Music Catalog';
    public totalNumberOfAlbums = 0;
    public pageSize = 50;
    public totalNumberOfPages = 0;
    public headerForm = new FormGroup({
        offset: new FormControl(),
        keywords: new FormControl(),
    });
    public id = 'music-catalog-header';

    public constructor(
        private albumsFactory: AlbumsFactoryInterface,
    ) {
        this.albumsFactory.getAlbumsMetaData().subscribe((albumsMetaData: AlbumsMetaData) => {
            this.totalNumberOfAlbums = albumsMetaData.totalNumberOfRecords;
            this.pageSize = albumsMetaData.pageSize;
            this.totalNumberOfPages = Math.round(this.totalNumberOfAlbums / this.pageSize);
        });
    }
}
