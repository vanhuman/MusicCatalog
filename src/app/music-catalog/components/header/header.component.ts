import { Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
    selector: 'music-catalog-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css'],
})
export class HeaderComponent {
    public title = 'Sutton Music Catalog';
    public numberOfRecords = 2950;
    public numberOfPages = 54;
    public headerForm = new FormGroup({
        offset: new FormControl(),
        keywords: new FormControl(),
    });
    public id = 'music-catalog-header';

    public constructor() {
        //
    }
}
