import { Component, Input } from '@angular/core';
import { AlbumInterface } from '../../../models/album.model.interface';
import { TooltipConfig } from '../../../tooltip/tooltip.directive';

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

    public getTooltipConfig(field: string): TooltipConfig {
        let title = '';
        switch (field) {
            case 'artist':
                title = this.album.getArtist().getName();
                break;
            case 'title':
                title = this.album.getTitle();
                break;
            case 'label':
                title = this.album.getLabel().getName();
                break;
        }
        return {
            title,
            topOffset: 10,
        };
    }
}
