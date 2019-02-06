import { Component } from '@angular/core';
import { McCommunication } from './models/music-catalog-communication.interface';

@Component({
    selector: 'music-catalog',
    templateUrl: './music-catalog.component.html',
    styleUrls: ['./music-catalog.component.css'],
})
export class MusicCatalogComponent {
    public loggedIn = false;
    public outputToOverview: McCommunication;

    public processInputFromHeader(mcCommunication: McCommunication): void {
        this.outputToOverview = mcCommunication;
    }

    public processInputFromLogin(mcCommunication: McCommunication): void {
        switch (mcCommunication.action) {
            case 'loggedIn':
                this.loggedIn = true;
                break;
            default:
                //
                break;
        }
    }
}
