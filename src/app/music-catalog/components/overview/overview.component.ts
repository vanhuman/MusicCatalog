import { Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { takeWhile } from 'rxjs/operators';

import { AlbumsFactoryInterface, GetAlbumsParams } from '../../factories/albums.factory.interface';
import { AlbumInterface } from '../../models/album.model.interface';
import { McCommunication } from '../../models/music-catalog-communication.interface';
import { TooltipConfig } from '../../directives/tooltip/tooltip.directive';
import { ImageUtility } from '../../utilities/image.utility';

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
    public albums: AlbumInterface[] = [];
    public columns: Column[] = [];
    public arrowImage = ImageUtility.imagePath + 'arrow-left.png';

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
                default:
                    //
                    break;
            }
        }
    }

    public constructor(
        private albumsFactory: AlbumsFactoryInterface,
        private element: ElementRef,
    ) {
        this.getAlbums();
        this.defineColumns();
    }

    @HostListener('window:scroll')
    public onScroll() {
        const element = <HTMLElement>this.element.nativeElement;
        if (element) {
            if (!this.loading && window.scrollY >= (element.clientHeight - window.innerHeight) * 0.5) {
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
            title: 'Artist',
            sortField: 'artist_name',
            sortDirection: 'ASC',
            class: 'artist',
        });
        this.columns.push({
            title: 'Title',
            sortField: 'title',
            sortDirection: 'ASC',
            class: 'title',
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
