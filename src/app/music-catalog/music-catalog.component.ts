import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { McCommunication } from './models/music-catalog-communication.interface';
import { AuthenticationServiceInterface } from './services/authentication.service.interface';
import { AuthenticationResult } from './services/authentication.service';
import { skip, take } from 'rxjs/operators';

@Component({
    selector: 'music-catalog',
    templateUrl: './music-catalog.component.html',
    styleUrls: ['./music-catalog.component.css'],
})
export class MusicCatalogComponent implements OnDestroy {
    public validSession = false;
    public showLogin = false;
    public outputToOverview: McCommunication;
    public outputToHeader: McCommunication;
    private authenticationMonitorSubscription: Subscription;

    public constructor(
        private authenticationService: AuthenticationServiceInterface,
    ) {
        this.getSession();
    }

    public ngOnDestroy(): void {
        if (this.authenticationMonitorSubscription) {
            this.authenticationMonitorSubscription.unsubscribe();
        }
    }

    public processInputFromHeader(mcCommunication: McCommunication): void {
        if (mcCommunication && mcCommunication.action === 'login') {
            this.showLogin = true;
        }
        this.outputToOverview = mcCommunication;
    }

    public processInputFromLogin(loggedIn: boolean): void {
        this.showLogin = false;
        if (loggedIn) {
            this.outputToOverview = {
                action: 'loggedIn',
            };
        }
    }

    public processInputFromOverview(mcCommunication: McCommunication): void {
        this.outputToHeader = mcCommunication;
    }

    private getSession(): void {
        this.authenticationService.login('dummy', 'dummylogin', true)
            .pipe(take(1))
            .subscribe((loginResult: AuthenticationResult) => {
                if (loginResult.succes) {
                    this.outputToOverview = {
                        action: 'loggedIn',
                    };
                    this.validSession = true;
                    this.authenticationMonitorSubscription = this.authenticationService.monitorValidSession()
                        .pipe(skip(1))
                        .subscribe((validSession) => {
                            if (!validSession) {
                                this.authenticationMonitorSubscription.unsubscribe();
                                this.getSession();
                            }
                        });
                }
            });
    }
}
