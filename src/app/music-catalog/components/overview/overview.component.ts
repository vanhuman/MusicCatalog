import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { takeWhile } from 'rxjs/operators';

import { AlbumsFactoryInterface, GetAlbumsParams } from '../../factories/albums/albums.factory.interface';
import { AlbumInterface } from '../../models/album.model.interface';
import { McCommunication } from '../../models/music-catalog-communication.interface';
import { TooltipConfig } from '../../directives/tooltip/tooltip.directive';
import { Configuration } from '../../configuration';
import { ModalServiceInterface } from '../../services/modal.service.interface';

export type SortField = 'title' | 'year' | 'date_added'
    | 'artist_name' | 'format_name' | 'label_name' | 'genre_description';

export type SortDirection = 'ASC' | 'DESC';

interface Column {
    title: string;
    sortField: SortField;
    sortDirection: SortDirection;
    class: string;
}

@Component({
    selector: 'music-catalog-overview',
    templateUrl: './overview.component.html',
    styleUrls: ['./overview.component.css'],
})
export class OverviewComponent {
    @Output() public mcCommunicationOut: EventEmitter<McCommunication> = new EventEmitter<McCommunication>();

    public albums: AlbumInterface[] = [];
    public columns: Column[] = [];
    public arrowImage = Configuration.IMAGE_PATH + 'arrow-left.png';
    public showImages = Configuration.SHOW_IMAGES;
    public albumToEdit: AlbumInterface;
    public showAlbumEdit = false;

    private loading = false;
    private page = 1;
    private keywords = '';
    private sortField: SortField = 'date_added';
    private sortDirection: SortDirection = 'DESC';
    private prevClickedColumn: Column;

    @ViewChild('musicCatalogOverview') musicCatalogOverview: ElementRef;

    @Input()
    set mcCommunication(mcCommunication: McCommunication) {
        if (mcCommunication) {
            switch (mcCommunication.action) {
                case 'search':
                    this.page = mcCommunication.page;
                    this.keywords = mcCommunication.keywords;
                    this.scrollUp(false);
                    this.getAlbums(false);
                    break;
                case 'addAlbum':
                    this.albumToEdit = null;
                    this.showAlbumEdit = true;
                    break;
                default:
                    //
                    break;
            }
        }
    }

    public constructor(
        private albumsFactory: AlbumsFactoryInterface,
        private element: ElementRef,
        private modalService: ModalServiceInterface,
    ) {
        this.getAlbums();
        this.defineColumns();
    }

    @HostListener('window:scroll')
    public onScroll() {
        const element = <HTMLElement>this.element.nativeElement;
        if (element) {
            if (!this.loading && window.scrollY >= (element.clientHeight - window.innerHeight) * 0.9) {
                this.page = this.page + 1;
                this.getAlbums();
            }
        }
    }

    public scrollUp(smooth: boolean = true): void {
        window.scrollTo({
            top: 0,
            behavior: smooth ? 'smooth' : 'auto',
        });
    }

    public sortOn(clickedColumn: Column): void {
        this.columns.forEach((column) => {
            if (column === clickedColumn && column === this.prevClickedColumn) {
                switch (column.sortDirection) {
                    case 'ASC':
                        column.sortDirection = 'DESC';
                        break;
                    case 'DESC':
                        column.sortDirection = 'ASC';
                        break;
                    default:
                        //
                        break;
                }
            }
        });
        this.prevClickedColumn = clickedColumn;
        this.sortField = clickedColumn.sortField;
        this.sortDirection = clickedColumn.sortDirection;
        this.scrollUp(false);
        this.page = 1;
        this.mcCommunicationOut.emit({
            action: 'sort',
            page: 1,
        });
        this.getAlbums(false);
    }

    public getTooltipConfig(column: Column): TooltipConfig {
        return {
            title: 'Sort on ' + column.title,
            centered: false,
            leftOffset: 20,
            arrowPositionVertical: 'top',
            topOffset: 65
        };
    }

    public getArrowClass(column: Column): string {
        let arrowClass: string;
        if (column.sortDirection === 'DESC') {
            arrowClass = 'up';
        } else {
            arrowClass = 'down';
        }
        return arrowClass;
    }

    public processInputFromAlbumRow(mcCommunication: McCommunication): void {
        if (mcCommunication.action === 'editAlbum') {
            this.albumToEdit = mcCommunication.item;
            this.showAlbumEdit = true;
        }
        if (mcCommunication.action === 'deleteAlbum') {
            const album: AlbumInterface = mcCommunication.item;
            if (album) {
                this.modalService.getModal('message-modal')
                    .setMessage('Are you sure you want to delete the album ' + album.getTitle() + ' ?')
                    .addYesButton(() => {
                        this.albumsFactory.deleteAlbum(mcCommunication.item).subscribe({
                            next: () => {
                                this.getAlbums(false);
                            },
                        });
                    })
                    .addNoButton(() => {
                    })
                    .open();
            }
        }
    }

    public processInputFromAlbumEdit(mcCommunication: McCommunication): void {
        let index: number;
        switch (mcCommunication.action) {
            case 'close':
                this.albumToEdit = null;
                this.showAlbumEdit = false;
                break;
            case 'saved':
                this.albumToEdit = null;
                this.showAlbumEdit = false;
                if (mcCommunication.item && this.albums.indexOf(mcCommunication.item) === -1) {
                    this.albums.unshift(mcCommunication.item);
                    this.getAlbums(false);
                }
                break;
            case 'previous':
                index = this.albums.indexOf(this.albumToEdit);
                if (index > 0) {
                    this.albumToEdit = this.albums[index - 1];
                }
                break;
            case 'next':
                index = this.albums.indexOf(this.albumToEdit);
                if (this.albums.length < index + 10) {
                    this.page = this.page + 1;
                    this.getAlbums();
                }
                if (index < this.albums.length - 1) {
                    this.albumToEdit = this.albums[index + 1];
                }
                break;
            default:
                break;
        }
    }

    private getAlbums(concat: boolean = true): void {
        this.loading = true;
        const getAlbumsParams: GetAlbumsParams = {
            page: this.page,
            keywords: this.keywords,
            sortby: this.sortField,
            sortdirection: this.sortDirection,
        };
        this.albumsFactory.getAlbums(getAlbumsParams)
            .pipe(takeWhile(() => this.loading))
            .subscribe({
                next: (response) => {
                    this.loading = false;
                    if (concat) {
                        this.albums = this.albums.concat(response);
                    } else {
                        this.albums = response;
                    }
                },
                error: () => {
                    this.loading = false;
                }
            });
    }

    private defineColumns(): void {
        this.columns.push({
            title: 'Title',
            sortField: 'title',
            sortDirection: 'ASC',
            class: 'title',
        });
        this.columns.push({
            title: 'Artist',
            sortField: 'artist_name',
            sortDirection: 'ASC',
            class: 'artist',
        });
        this.columns.push({
            title: 'Year',
            sortField: 'year',
            sortDirection: 'DESC',
            class: 'year',
        });
        this.columns.push({
            title: 'Format',
            sortField: 'format_name',
            sortDirection: 'ASC',
            class: 'format',
        });
        this.columns.push({
            title: 'Label',
            sortField: 'label_name',
            sortDirection: 'ASC',
            class: 'label',
        });
        this.columns.push({
            title: 'Genre',
            sortField: 'genre_description',
            sortDirection: 'ASC',
            class: 'genre',
        });
        this.columns.push({
            title: 'Date Added',
            sortField: 'date_added',
            sortDirection: 'DESC',
            class: 'date-added',
        });
        this.prevClickedColumn = this.columns[this.columns.length - 1];
    }

}
