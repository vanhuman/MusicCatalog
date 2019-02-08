import { Component } from '@angular/core';
import { McCommunication } from './models/music-catalog-communication.interface';
import { AuthenticationServiceInterface } from './services/authentication.service.interface';

@Component({
    selector: 'music-catalog',
    templateUrl: './music-catalog.component.html',
    styleUrls: ['./music-catalog.component.css'],
})
export class MusicCatalogComponent {
    public loggedIn = false;
    public outputToOverview: McCommunication;

    public constructor(
        private authenticationService: AuthenticationServiceInterface,
    ) {
        //
    }

    public processInputFromHeader(mcCommunication: McCommunication): void {
        this.outputToOverview = mcCommunication;
    }

    public processInputFromLogin(loggedIn: boolean): void {
        this.loggedIn = loggedIn;
    }

    public processInputFromOverview(authorised: boolean): void {
        this.loggedIn = authorised;
        if (!authorised) {
            this.authenticationService.removeSession();
        }
    }
}
