import { Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { AlbumInterface } from '../../../models/album.model.interface';
import { AlbumsFactoryInterface } from '../../../factories/albums/albums.factory.interface';
import { AlbumPostData } from '../../../models/api-post-data/album-api-post-data.interface';
import { McCommunication } from '../../../models/music-catalog-communication.interface';
import { Configuration } from '../../../configuration';
import * as moment from 'moment';

@Component({
    selector: 'music-catalog-album',
    templateUrl: './album.component.html',
    styleUrls: ['./album.component.css'],
})
export class AlbumComponent {
    @Output() mcCommunicationOut: EventEmitter<McCommunication> = new EventEmitter<McCommunication>();

    public editImage = Configuration.IMAGE_PATH + 'edit.svg';
    public deleteImage = Configuration.IMAGE_PATH + 'delete.svg';
    public showImages = Configuration.SHOW_IMAGES;
    public imageThumbDefault = Configuration.IMAGE_PATH + 'transparant.png';

    private _album: AlbumInterface;

    public constructor(
        private albumsFactory: AlbumsFactoryInterface,
        private elementRef: ElementRef,
    ) {
    }

    @Input()
    set album(album: AlbumInterface) {
        this._album = album;
        this.getImages(this.album);
    }

    get album(): AlbumInterface {
        return this._album;
    }

    @Input()
    set mcCommunication(mcCommunication: McCommunication) {
        if (mcCommunication && mcCommunication.action === 'getImage' && mcCommunication.item === this.album) {
            this.getImages(this.album, true);
        }
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

    public getTop(): string {
        if ((<HTMLElement>this.elementRef.nativeElement).offsetTop < 250) {
            return '-30px';
        } else if ((<HTMLElement>this.elementRef.nativeElement).offsetTop > 0.7 * window.innerHeight) {
            return '-300px';
        } else {
            return '-150px';
        }
    }

    private getImages(album: AlbumInterface, forced: boolean = false): void {
        if (!album.getImageThumb() || !album.getImage()) {
            album.setImageThumb(this.imageThumbDefault);
            const fetchInterval = new Date();
            fetchInterval.setDate(fetchInterval.getDate() - Configuration.IMAGE_FETCH_INTERVAL);
            if (forced || !album.getImageFetchTimestamp() || album.getImageFetchTimestamp() < fetchInterval) {
                let albumPostData: AlbumPostData;
                this.albumsFactory.getImagesFromLastfm(album).then(
                    (imageMap) => {
                        if (imageMap.has('small') && imageMap.get('small')
                            && imageMap.has('extralarge') && imageMap.get('extralarge')) {
                            const imageThumb = imageMap.get('small');
                            const imageExtralarge = imageMap.get('extralarge');
                            // save the image locations in the database
                            albumPostData = {
                                image_thumb: imageThumb,
                                image: imageExtralarge,
                                image_fetch_timestamp: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                            };
                            this.albumsFactory.putAlbum(albumPostData, album);
                        } else {
                            // save the image fetch timestamp in the database
                            albumPostData = {
                                image_fetch_timestamp: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
                            };
                            this.albumsFactory.putAlbum(albumPostData, album);
                        }
                    },
                    () => {
                    }
                );
            }
        }
    }
}
