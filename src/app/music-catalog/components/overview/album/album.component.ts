import { Component, Input } from '@angular/core';
import { AlbumInterface } from '../../../models/album.model.interface';

@Component({
    selector: 'music-catalog-album',
    templateUrl: './album.component.html',
    styleUrls: ['./album.component.css'],
})
export class AlbumComponent {
    @Input() album: AlbumInterface;

    public constructor() {
        //
    }
}
