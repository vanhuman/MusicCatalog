import { Component, ElementRef, Input, OnInit, OnDestroy } from '@angular/core';
import { ModalServiceInterface } from '../services/modal.service.interface';

@Component({
    selector: 'custom-modal',
    templateUrl: './custom-modal.component.html',
    styleUrls: ['./custom-modal.component.css'],
})

export class CustomModalComponent implements OnInit, OnDestroy {
    @Input() id: string;
    public message = '';
    private element: any;

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
    }

    public ngOnDestroy(): void {
        this.modalService.remove(this.id);
        this.element.remove();
    }

    public setMessage(message: string): CustomModalComponent {
        this.message = message;
        return this;
    }

    public open(): void {
        this.element.style.display = 'block';
        document.body.classList.add('custom-modal-open');
    }

    public close(): void {
        this.element.style.display = 'none';
        document.body.classList.remove('custom-modal-open');
    }
}
