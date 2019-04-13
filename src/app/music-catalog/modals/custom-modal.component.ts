import { Component, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';
import { ModalServiceInterface } from '../services/modal.service.interface';
import { KeyCode, KeyStrokeUtility } from '../utilities/key-stroke.utility';
import { ErrorApiResponse } from '../models/api-responses/error-api-response.interface';
import { errorTypeMap } from '../constants/error-type.map';

export type MessageStyle = '' | 'bold' | 'italic' | 'big' | 'align-center' | 'new-line' | 'red';

export interface ModalMessage {
    text: string;
    styles: MessageStyle[];
}

@Component({
    selector: 'custom-modal',
    templateUrl: './custom-modal.component.html',
    styleUrls: ['./custom-modal.component.css'],
})
export class CustomModalComponent implements OnInit, OnDestroy {
    @Input() id: string;
    public messages: ModalMessage[] = [];
    public showCloseButton = true;
    public showYesButton = false;
    public showNoButton = false;

    private element: any;
    private yesFunction: () => void;
    private noFunction: () => void;
    private defaultWidth = 300;
    private width = this.defaultWidth;

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

    public getWidth(): string {
        return this.width.toString();
    }

    public setWidth(width: number): CustomModalComponent {
        this.width = width;
        return this;
    }

    public getStyle(message: ModalMessage): string {
        return message.styles.join(' ');
    }

    public setMessage(text: string, styles: MessageStyle[] = []): CustomModalComponent {
        this.messages.push({
            text,
            styles,
        });
        return this;
    }

    public setErrorMessage(errorMessage: ErrorApiResponse): CustomModalComponent {
        this.messages.push({
            text: errorTypeMap.get(errorMessage.error_type.id.toString()),
            styles: ['big', 'new-line'],
        });
        this.messages.push({
            text: errorMessage.message,
            styles: [],
        });
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
        this.messages = [];
        this.width = this.defaultWidth;
    }

    private enter(): void {
        if (this.showYesButton) {
            this.yes();
        } else {
            this.close();
        }
    }
}
