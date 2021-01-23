import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject } from 'rxjs';
import { ModalServiceInterface } from '../../services/modal.service.interface';
import { ErrorHelperInterface } from './error.helper.interface';

@Injectable()
export class ErrorHelper implements ErrorHelperInterface {
    public constructor(
        private modalService: ModalServiceInterface,
    ) {
    }

    public errorHandling(error: HttpErrorResponse, observable: Subject<any>): void {
        if (error.status === 401) {
            error.error.message = 'Your session has expired. Please login again.';
        }
        if (this.modalService.getModal('modal1').isOpen()) {
            this.modalService.getModal('modal1').close();
        }
        this.modalService.getModal('modal1')
            .setErrorMessage(error.error)
            .open();
        observable.error(false);
    }
}
