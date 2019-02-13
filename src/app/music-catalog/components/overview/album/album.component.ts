import { AfterViewInit, Component, Input } from '@angular/core';
import { AlbumInterface } from '../../../models/album.model.interface';
import { TooltipConfig } from '../../../directives/tooltip/tooltip.directive';
import { ImageUtility } from '../../../utilities/image.utility';
import { AlbumsFactoryInterface } from '../../../factories/albums.factory.interface';

@Component({
    selector: 'music-catalog-album',
    templateUrl: './album.component.html',
    styleUrls: ['./album.component.css'],
})
export class AlbumComponent implements AfterViewInit {
    @Input() album: AlbumInterface;

    public editImage = ImageUtility.imagePath + 'edit.svg';
    public deleteImage = ImageUtility.imagePath + 'delete.svg';
    public imageSmall = ImageUtility.imagePath + 'transparant.png';
    public imageExtralargeExists = false;
    public imageExtralarge: string;

    public constructor(
        private albumsFactory: AlbumsFactoryInterface,
    ) {
    }

    public ngAfterViewInit(): void {
        this.albumsFactory.getImageFromLastfm(this.album).then(
            (imageMap) => {
                if (imageMap.has('small') && imageMap.get('small')) {
                    this.imageSmall = imageMap.get('small');
                }
                if (imageMap.has('extralarge') && imageMap.get('extralarge')) {
                    this.imageExtralargeExists = true;
                    this.imageExtralarge = imageMap.get('extralarge');
                }
            });
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
