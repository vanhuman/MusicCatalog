import { Component } from '@angular/core';
import { HttpParams } from '@angular/common/http';
import { AuthenticationService } from '../../services/authentication.service';
import { ApiRequestService } from '../../services/api-request.service';

@Component({
    selector: 'music-catalog-overview',
    templateUrl: './overview.component.html',
})
export class OverviewComponent {

    public constructor(
        private authenticationService: AuthenticationService,
        private apiRequestService: ApiRequestService,
    ) {
        const token = this.authenticationService.getToken();
        let params = new HttpParams();
        // params = params.set('token', 'cb903a11c2ba85e37b61c6368dde614d6aae200b');
        params = params.set('token', token);
        this.apiRequestService.get<any>('/albums', params).subscribe({
            next: (response) => {
                console.log(response);
            },
            error: (error) => {
                console.log(error);
            }
        });
    }
}
