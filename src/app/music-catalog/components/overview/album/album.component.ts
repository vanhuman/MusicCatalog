import { Component, Input } from '@angular/core';
import { AlbumInterface } from '../../../models/album.model.interface';
import { TooltipConfig } from '../../../directives/tooltip/tooltip.directive';
import { ImageUtility } from '../../../utilities/image.utility';

@Component({
    selector: 'music-catalog-album',
    templateUrl: './album.component.html',
    styleUrls: ['./album.component.css'],
})
export class AlbumComponent {
    @Input() album: AlbumInterface;

    public editImage = ImageUtility.imagePath + 'edit.svg';
    public deleteImage = ImageUtility.imagePath + 'delete.svg';

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
            topOffset: 5,
        };
    }
}
