import { Component } from '@angular/core';

@Component({
    selector: 'music-catalog',
    templateUrl: './music-catalog.component.html',
    styleUrls: ['./music-catalog.component.css'],
})
export class MusicCatalogComponent {
    public loggedIn = false;

    public constructor(
    ) {
    }
}
