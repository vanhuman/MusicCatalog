import { Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AlbumsFactoryInterface } from '../../factories/albums.factory.interface';
import { AlbumsMetaData } from '../../factories/albums.factory.interface';
import { McCommunication } from '../../models/music-catalog-communication.interface';
import { NumberUtility } from '../../utilities/number.utility';

@Component({
    selector: 'music-catalog-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
    @Output() mcCommunication: EventEmitter<McCommunication> = new EventEmitter<McCommunication>();

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
            this.totalNumberOfPages = Math.ceil(this.totalNumberOfAlbums / this.pageSize);
        });
    }

    public goToPage(): void {
        const page = this.headerForm.controls['offset'].value;
        if (NumberUtility.isInt(page)) {
            this.mcCommunication.emit({
                action: 'goToPage',
                page: Number(page),
            });
        }
    }

    public search(): void {
        const keywords = this.headerForm.controls['keywords'].value;
        if (keywords) {
            this.mcCommunication.emit({
                action: 'search',
                keywords,
            });
        }
    }
}
