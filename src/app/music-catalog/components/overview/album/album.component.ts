import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AlbumInterface } from '../../../models/album.model.interface';
import { TooltipConfig } from '../../../directives/tooltip/tooltip.directive';
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
    @Output() mcCommunicationOut: EventEmitter<McCommunication> = new EventEmitter<McCommunication>();

    public editImage = Configuration.IMAGE_PATH + 'edit.svg';
    public deleteImage = Configuration.IMAGE_PATH + 'delete.svg';
    public imageThumb = Configuration.IMAGE_PATH + 'transparant.png';
    public imageExtralargeExists = false;
    public imageExtralarge: string;
    public showImages = Configuration.SHOW_IMAGES;

    public constructor(
        private albumsFactory: AlbumsFactoryInterface,
    ) {
    }

    @Input()
    set mcCommunication(mcCommunication: McCommunication) {
        if (mcCommunication && mcCommunication.action === 'getImage' && mcCommunication.item === this.album) {
            this.getImages();
        }
    }

    public ngOnInit(): void {
        this.getImages();
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
                title = this.album.getLabel() ? this.album.getLabel().getName() : '';
                break;
        }
        return {
            title,
            topOffset: 5,
        };
    }

    public edit(): void {
        this.mcCommunicationOut.emit({
            item: this.album,
            action: 'editAlbum',
        });
    }

    public delete(event: MouseEvent): void {
        event.stopPropagation();
        this.mcCommunicationOut.emit({
            item: this.album,
            action: 'deleteAlbum',
        });
    }

    private getImages(): void {
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
}
