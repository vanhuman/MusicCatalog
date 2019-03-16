import { Component, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';
import { ModalServiceInterface } from '../services/modal.service.interface';
import { KeyCode, KeyStrokeUtility } from '../utilities/key-stroke.utility';

@Component({
    selector: 'custom-modal',
    templateUrl: './custom-modal.component.html',
    styleUrls: ['./custom-modal.component.css'],
})

export class CustomModalComponent implements OnInit, OnDestroy {
    @Input() id: string;
    public message = '';
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

        if (!this.id) {
            console.error('The modal must have an id.');
            return;
        }

        document.body.appendChild(this.element);

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
        this.showYesButton = false;
        this.showNoButton = false;
    }

    public yes(): void {
        this.yesFunction();
        this.close();
    }

    public no(): void {
        this.noFunction();
        this.close();
    }

    private enter(): void {
        if (this.showYesButton) {
            this.yes();
        } else {
            this.close();
        }
    }
}
