import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { McCommunication } from './models/music-catalog-communication.interface';
import { AuthenticationServiceInterface } from './services/authentication.service.interface';

@Component({
    selector: 'music-catalog',
    templateUrl: './music-catalog.component.html',
    styleUrls: ['./music-catalog.component.css'],
})
export class MusicCatalogComponent implements OnDestroy {
    public loggedIn = false;
    public outputToOverview: McCommunication;
    public outputToHeader: McCommunication;
    private authenticationSubscription: Subscription;

    public constructor(
        private authenticationService: AuthenticationServiceInterface,
    ) {
        this.authenticationSubscription = this.authenticationService.monitorLogin()
            .subscribe((loggedIn) => {
                this.loggedIn = loggedIn;
            });
    }

    public ngOnDestroy(): void {
        this.authenticationSubscription.unsubscribe();
    }

    public processInputFromHeader(mcCommunication: McCommunication): void {
        this.outputToOverview = mcCommunication;
    }

    public processInputFromLogin(loggedIn: boolean): void {
        this.loggedIn = loggedIn;
    }

    public processInputFromOverview(mcCommunication: McCommunication): void {
        this.outputToHeader = mcCommunication;
    }
}
