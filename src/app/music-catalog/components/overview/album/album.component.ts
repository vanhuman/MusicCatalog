import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AlbumInterface } from '../../../models/album.model.interface';
import { TooltipConfig } from '../../../directives/tooltip/tooltip.directive';
import { ImageUtility } from '../../../utilities/image.utility';
import { AlbumsFactoryInterface } from '../../../factories/albums/albums.factory.interface';
import { AlbumPostData } from '../../../models/api-post-data/album-api-post-data.interface';
import { McCommunication } from '../../../models/music-catalog-communication.interface';
import { Configuration } from '../../../configuration';

@Component({
    selector: 'music-catalog-album',
    templateUrl: './album.component.html',
    styleUrls: ['./album.component.css'],
})
export class AlbumComponent implements OnInit {
    @Input() album: AlbumInterface;
    @Output() mcCommunication: EventEmitter<McCommunication> = new EventEmitter<McCommunication>();

    public editImage = ImageUtility.imagePath + 'edit.svg';
    public deleteImage = ImageUtility.imagePath + 'delete.svg';
    public imageThumb = ImageUtility.imagePath + 'transparant.png';
    public imageExtralargeExists = false;
    public imageExtralarge: string;
    public showImages = Configuration.SHOW_IMAGES;

    public constructor(
        private albumsFactory: AlbumsFactoryInterface,
    ) {
    }

    public ngOnInit(): void {
        if (this.album.getImageThumb() && this.album.getImageThumb()) {
            this.imageThumb = this.album.getImageThumb();
            this.imageExtralarge = this.album.getImage();
            this.imageExtralargeExists = true;
        } else {
            this.albumsFactory.getImagesFromLastfm(this.album).then(
                (imageMap) => {
                    if (imageMap.has('small') && imageMap.get('small')) {
                        this.imageThumb = imageMap.get('small');
                        if (imageMap.has('extralarge') && imageMap.get('extralarge')) {
                            this.imageExtralargeExists = true;
                            this.imageExtralarge = imageMap.get('extralarge');
                            // save the image locations in the database
                            const albumPostData: AlbumPostData = {
                                image_thumb: this.imageThumb,
                                image: this.imageExtralarge,
                            };
                            this.albumsFactory.putAlbum(albumPostData, this.album);
                        }
                    }
                },
                () => {
                }
            );
        }
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

    public edit(): void {
        this.mcCommunication.emit({
           item: this.album,
           action: 'edit',
        });
    }
}
