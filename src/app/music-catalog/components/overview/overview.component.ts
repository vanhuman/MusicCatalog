import { Component, ElementRef, HostListener } from '@angular/core';
import { AlbumsFactoryInterface } from '../../factories/albums.factory.interface';
import { AlbumInterface } from '../../models/album.model.interface';

@Component({
    selector: 'music-catalog-overview',
    templateUrl: './overview.component.html',
    styleUrls: ['./overview.component.css'],
})
export class OverviewComponent {
    public albums: AlbumInterface[] = [];
    private loading = false;
    private page = 1;

    public constructor(
        private albumsFactory: AlbumsFactoryInterface,
        private element: ElementRef,
    ) {
        this.getAlbums();
    }

    private getAlbums(): void {
        this.loading = true;
        this.albumsFactory.getAlbums(this.page).subscribe({
            next: (response) => {
                this.loading = false;
                this.albums = this.albums.concat(response);
                console.log(this.albums);
            },
            error: (error) => {
                this.loading = false;
            }
        });
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
}
