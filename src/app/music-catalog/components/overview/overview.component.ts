import {
    Component, ElementRef, EventEmitter, Input, Output, ViewChild
} from '@angular/core';
import { takeWhile } from 'rxjs/operators';

import { AlbumsFactoryInterface, GetAlbumsParams } from '../../factories/albums/albums.factory.interface';
import { AlbumInterface } from '../../models/album.model.interface';
import { McCommunication } from '../../models/music-catalog-communication.interface';
import { TooltipConfig } from '../../directives/tooltip/tooltip.directive';
import { Configuration } from '../../configuration';
import { ModalServiceInterface } from '../../services/modal.service.interface';
import { CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { CustomModalComponent } from '../../modals/custom-modal.component';
import { FactoryHelperInterface } from '../../factories/helpers/factory.helper.interface';

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
    @ViewChild(CdkVirtualScrollViewport) public scrollViewport: CdkVirtualScrollViewport;

    public albums: AlbumInterface[] = [];
    public columns: Column[] = [];
    public arrowImage = Configuration.ICONS_PATH + 'arrow-left.png';
    public showImages = Configuration.SHOW_IMAGES;
    public albumToEdit: AlbumInterface;
    public showAlbumEdit = false;
    public outputToAlbumRow: McCommunication;
    public itemSize = 27;
    public currentPage = 1;
    public showCurrentPage = false;
    public sortField: SortField = 'date_added';

    private loading = false;
    private page = 1;
    private keywords = '';
    private sortDirection: SortDirection = 'DESC';
    private prevClickedColumn: Column;
    private selectedAlbum: AlbumInterface;
    private modal: CustomModalComponent;
    private basePage = 1;
    private currentPageTimeOut;

    @Input()
    set mcCommunication(mcCommunication: McCommunication) {
        if (mcCommunication) {
            switch (mcCommunication.action) {
                case 'search':
                    this.page = mcCommunication.page;
                    this.basePage = this.page;
                    this.keywords = mcCommunication.keywords;
                    this.scrollUp();
                    this.getAlbums(false);
                    break;
                case 'addAlbum':
                    this.albumToEdit = null;
                    this.showAlbumEdit = true;
                    break;
                case 'removedOrphans':
                    this.factoryHelper.getRelatedEntities(true);
                    break;
                case 'loggedIn':
                    this.outputToAlbumRow = mcCommunication;
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
        private factoryHelper: FactoryHelperInterface,
    ) {
        this.getAlbums();
        this.defineColumns();
    }

    public getPaddingBottom(): number {
        return window.innerHeight - (this.albums.length * this.itemSize) > 0 ? 300 : 20;
    }

    public onScroll() {
        if (!this.loading && this.scrollViewport.measureScrollOffset('bottom') < 500) {
            this.page = this.page + 1;
            this.getAlbums();
        }
        const numberOfItemsScrolled = this.scrollViewport.measureScrollOffset('top') / this.itemSize;
        const page = this.basePage + Math.floor(numberOfItemsScrolled / Configuration.PAGE_SIZE);
        if (page !== this.currentPage) {
            this.currentPage = page;
            this.showCurrentPage = true;
            if (this.currentPageTimeOut) {
                clearTimeout(this.currentPageTimeOut);
            }
            this.currentPageTimeOut = setTimeout(() => {
                this.currentPageTimeOut = null;
                this.showCurrentPage = false;
            }, 5000);
        }
    }

    public scrollUp(behavior: ScrollBehavior = 'auto'): void {
        this.scrollViewport.scrollToIndex(0, behavior);
    }

    public sortOn(clickedColumn: Column): void {
        this.columns.forEach((column) => {
            if (column === clickedColumn && column === this.prevClickedColumn) {
                column.sortDirection = column.sortDirection === 'ASC' ? 'DESC' : 'ASC';
            }
        });
        this.prevClickedColumn = clickedColumn;
        this.sortField = clickedColumn.sortField;
        this.sortDirection = clickedColumn.sortDirection;
        this.scrollUp();
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
            this.edit(mcCommunication.item);
        }
        if (mcCommunication.action === 'deleteAlbum') {
            const album: AlbumInterface = mcCommunication.item;
            if (album) {
                this.modal = this.modalService.getModal('modal1')
                    .setMessage('Are you sure you want to delete this album?')
                    .doCloseOnYes(false)
                    .newLine()
                    .setMessage(album.getTitle(), ['big'])
                    .setMessage(' by ')
                    .setMessage(album.getArtist().getFullName(), ['big'])
                    .setWidth(400)
                    .addYesButton(() => {
                        this.albumsFactory.deleteAlbum(mcCommunication.item).subscribe({
                            next: () => {
                                this.modal.close();
                                this.mcCommunicationOut.emit({
                                    action: 'albumDeleted',
                                });
                            },
                            error: () => {
                                //
                            }
                        });
                    })
                    .addNoButton(() => {
                    });
                this.modal.open();
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
                if (mcCommunication.item && this.albums.indexOf(mcCommunication.item) === -1) {
                    this.page = 1;
                    this.albums.unshift(mcCommunication.item);
                    this.getAlbums(false);
                }
                if (mcCommunication.fetchImage) {
                    this.outputToAlbumRow = {
                        action: 'getImage',
                        item: mcCommunication.item,
                    };
                }
                break;
            case 'previous':
                index = this.albums.indexOf(this.albumToEdit);
                if (index > 0) {
                    this.albumToEdit = this.albums[index - 1];
                    this.selectedAlbum = this.albumToEdit;
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
                    this.selectedAlbum = this.albumToEdit;
                }
                break;
            default:
                break;
        }
    }

    public edit(album: AlbumInterface): void {
        this.albumToEdit = album;
        this.showAlbumEdit = true;
    }

    public isSelected(album: AlbumInterface): string {
        return album === this.selectedAlbum ? 'selected' : '';
    }

    public select(album: AlbumInterface): void {
        this.selectedAlbum = album;
    }

    private getAlbums(concat: boolean = true): void {
        this.loading = true;
        if (!concat) {
            this.albumsFactory.clearThrottleQueue();
        }
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
