import { Component } from '@angular/core';
import { AuthenticationService } from './services/authentication.service';

@Component({
    selector: 'music-catalog',
    templateUrl: './music-catalog.component.html',
    styleUrls: ['./music-catalog.component.css'],
})
export class MusicCatalogComponent {
    public loggedIn = false;

    public constructor(
        private authenticationService: AuthenticationService,
    ) {
        this.authenticationService.login().subscribe((loginSuccesful) => {
            this.loggedIn = loginSuccesful;
        });
    }
}
