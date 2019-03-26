import { Component, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';
import { ModalServiceInterface } from '../services/modal.service.interface';
import { KeyCode, KeyStrokeUtility } from '../utilities/key-stroke.utility';
import { ErrorApiResponse } from '../models/api-responses/error-api-response.interface';
import { errorTypeMap } from '../constants/error-type.map';

@Component({
    selector: 'custom-modal',
    templateUrl: './custom-modal.component.html',
    styleUrls: ['./custom-modal.component.css'],
})

export class CustomModalComponent implements OnInit, OnDestroy {
    @Input() id: string;
    public message = '';
    public caption = '';
    public showCloseButton = true;
    public showYesButton = false;
    public showNoButton = false;

    private element: any;
    private yesFunction: () => void;
    private noFunction: () => void;

    constructor(
        private modalService: ModalServiceInterface,
        private el: ElementRef
    ) {
        this.element = el.nativeElement;
    }

    public ngOnInit(): void {
        const modal = this;
        this.element.addEventListener('click', function (element: any) {
            if (element.target.className === 'custom-modal'
                || element.target.className === 'custom-modal-background') {
                modal.close();
            }
        });
        this.modalService.add(this);

        const keyHandlings = [
            {
                keyStroke: <KeyCode>'Enter',
                function: () => this.enter.apply(this),
            },
            {
                keyStroke: <KeyCode>'Escape',
                function: () => this.close.apply(this),
            },
        ];
        KeyStrokeUtility.addListener(keyHandlings);
    }

    public ngOnDestroy(): void {
        this.modalService.remove(this.id);
        this.element.remove();
        KeyStrokeUtility.removeListener();
    }

    public setMessage(message: string): CustomModalComponent {
        this.message = message;
        return this;
    }

    public setErrorMessage(errorMessage: ErrorApiResponse): CustomModalComponent {
        this.message = errorMessage.message;
        this.caption = errorTypeMap.get(errorMessage.error_type.id.toString());
        return this;
    }

    public addYesButton(callBack: () => void): CustomModalComponent {
        this.showYesButton = true;
        this.yesFunction = callBack;
        return this;
    }

    public addNoButton(callBack: () => void): CustomModalComponent {
        this.showNoButton = true;
        this.showCloseButton = false;
        this.noFunction = callBack;
        return this;
    }

    public open(): void {
        this.element.style.display = 'block';
        document.body.classList.add('custom-modal-open');
    }

    public close(): void {
        this.element.style.display = 'none';
        document.body.classList.remove('custom-modal-open');
        this.reset();
    }

    public yes(): void {
        this.yesFunction();
        this.close();
    }

    public no(): void {
        this.noFunction();
        this.close();
    }

    private reset(): void {
        this.showYesButton = false;
        this.showNoButton = false;
        this.showCloseButton = true;
        this.caption = '';
        this.message = '';
    }

    private enter(): void {
        if (this.showYesButton) {
            this.yes();
        } else {
            this.close();
        }
    }
}
