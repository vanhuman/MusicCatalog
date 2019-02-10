import { Component, ElementRef, HostListener, Input, ViewChild } from '@angular/core';
import { takeWhile } from 'rxjs/operators';

import { AlbumsFactoryInterface } from '../../factories/albums.factory.interface';
import { AlbumInterface } from '../../models/album.model.interface';
import { McCommunication } from '../../models/music-catalog-communication.interface';

@Component({
    selector: 'music-catalog-overview',
    templateUrl: './overview.component.html',
    styleUrls: ['./overview.component.css'],
})
export class OverviewComponent {

    public albums: AlbumInterface[] = [];
    private loading = false;
    private page = 1;
    private keywords = '';

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

    private getAlbums(concat: boolean = true): void {
        this.loading = true;
        this.albumsFactory.getAlbums(this.page, this.keywords)
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
}
