import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ModalServiceInterface } from './modal.service.interface';

interface FormCloseServiceConfig {
    formCanCloseCallback: () => Observable<boolean>;
    supressDialog?: boolean;
}

@Injectable()
export class FormCloseService {

    private formCanCloseCallback: () => Observable<boolean> = null;
    private supressDialog = false;

    constructor(
        private modalService: ModalServiceInterface,
    ) {}

    public checkIfCanClose(): Promise<boolean> {
        return new Promise((resolve) => {
            if (this.formCanCloseCallback) {
                this.formCanCloseCallback().subscribe((canClose) => {
                    if (this.supressDialog) {
                        // in this case the dialog is already shown, the user has chosen
                        // and canClose is actually okToClose
                        resolve(canClose);
                    } else if (!canClose) {
                        this.modalService.getModal('modal1')
                            .setMessage('Are you sure you want to discard your changes?')
                            .setWidth(335)
                            .addYesButton(() => {
                                resolve(true);
                                this.reset();
                            })
                            .addNoButton(() => {
                                resolve(false);
                            })
                            .open();
                    } else {
                        resolve(true);
                    }
                });
            } else {
                resolve(true);
            }
        });
    }

    public configureOnClose(config: FormCloseServiceConfig): void {
        this.formCanCloseCallback = config.formCanCloseCallback;
        this.supressDialog = config.supressDialog;
    }

    public reset(): void {
        this.formCanCloseCallback = null;
    }
}
