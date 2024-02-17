import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

import { McCommunication } from './models/music-catalog-communication.interface';
import { AuthenticationServiceInterface } from './services/authentication.service.interface';

@Component({
    selector: 'music-catalog',
    templateUrl: './music-catalog.component.html',
    styleUrls: ['./music-catalog.component.css'],
})
export class MusicCatalogComponent implements OnInit, OnDestroy {
    public validSession = true;
    public showLogin = false;
    public outputToOverview: McCommunication;
    public outputToHeader: McCommunication;
    private authenticationMonitorSubscription: Subscription;

    public constructor(
        private authenticationService: AuthenticationServiceInterface,
    ) {
    }

    public ngOnInit() {
        this.authenticationMonitorSubscription = this.authenticationService.monitorValidSession()
            .subscribe((validSession) => {
                if (!validSession) {
                    this.validSession = false;
                    this.showLogin = true;
                }
            });
    }

    public ngOnDestroy(): void {
        if (this.authenticationMonitorSubscription) {
            this.authenticationMonitorSubscription.unsubscribe();
        }
    }

    public processInputFromHeader(mcCommunication: McCommunication): void {
        if (mcCommunication) {
            switch (mcCommunication.action) {
                case 'login':
                    this.showLogin = true;
                    break;
                case 'logout':
                    this.validSession = false;
                    this.showLogin = true;
                    this.authenticationService.logout();
                    break;
                default:
                //
            }
        }
        this.outputToOverview = mcCommunication;
    }

    public processInputFromLogin(loggedIn: boolean): void {
        this.showLogin = false;
        if (loggedIn) {
            this.validSession = true;
            this.outputToOverview = {
                action: 'loggedIn',
            };
        }
    }

    public processInputFromOverview(mcCommunication: McCommunication): void {
        this.outputToHeader = mcCommunication;
    }
}
