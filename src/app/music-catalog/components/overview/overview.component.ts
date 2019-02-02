import { Component } from '@angular/core';
import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { ApiRequestServiceInterface } from '../../services/api-request.service.interface';
import { AuthenticationServiceInterface } from '../../services/authentication.service.interface';
import { ModalServiceInterface } from '../../services/modal.service.interface';

@Component({
    selector: 'music-catalog-overview',
    templateUrl: './overview.component.html',
    styleUrls: ['./overview.component.css'],
})
export class OverviewComponent {

    public constructor(
        private authenticationService: AuthenticationServiceInterface,
        private apiRequestService: ApiRequestServiceInterface,
        private modalService: ModalServiceInterface,
    ) {
        const token = this.authenticationService.getToken();
        let params = new HttpParams();
        // params = params.set('token', 'cb903a11c2ba85e37b61c6368dde614d6aae200b');
        params = params.set('token', token);
        this.apiRequestService.get<any>('/albums', params).subscribe({
            next: (response) => {
                console.log(response);
            },
            error: (error: HttpErrorResponse) => {
                console.log(error);
                this.modalService.getModal('message-modal')
                    .setMessage(error.error.message)
                    .open();
            }
        });
    }
}
