import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

import { NumberUtility } from '../../utilities/number.utility';
import { AlbumsFactoryInterface } from '../../factories/albums/albums.factory.interface';
import { AlbumsMetaData } from '../../factories/albums/albums.factory.interface';
import { McCommunication } from '../../models/music-catalog-communication.interface';
import { Configuration } from '../../configuration';
import { AuthenticationServiceInterface } from '../../services/authentication.service.interface';
import { FactoryHelperInterface } from '../../factories/factory.helper.interface';
import { ModalServiceInterface } from '../../services/modal.service.interface';
import { CustomModalComponent } from '../../modals/custom-modal.component';

@Component({
    selector: 'music-catalog-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnDestroy {
    @Output() mcCommunicationOut: EventEmitter<McCommunication> = new EventEmitter<McCommunication>();

    public title = Configuration.APPLICATION_TITLE;
    public totalNumberOfAlbums = 0;
    public pageSize = 50;
    public totalNumberOfPages = 0;
    public headerForm = new FormGroup({
        page: new FormControl(1),
        keywords: new FormControl(''),
    });
    public id = 'music-catalog-header';
    public menuIcon = Configuration.IMAGE_PATH + 'menu.png';

    private metaDataSubscription: Subscription;
    private modal: CustomModalComponent;

    @Input()
    set mcCommunication(mcCommunication: McCommunication) {
        if (mcCommunication) {
            switch (mcCommunication.action) {
                case 'sort':
                    if (mcCommunication.page != null) {
                        this.headerForm.controls['page'].setValue(mcCommunication.page);
                    }
                    break;
                default:
                    //
                    break;
            }
        }
    }

    public constructor(
        private albumsFactory: AlbumsFactoryInterface,
        private authenticationService: AuthenticationServiceInterface,
        private factoryHelper: FactoryHelperInterface,
        private modalService: ModalServiceInterface,
    ) {
        this.metaDataSubscription = this.albumsFactory.getAlbumsMetaData()
            .subscribe((albumsMetaData: AlbumsMetaData) => {
                this.totalNumberOfAlbums = albumsMetaData.totalNumberOfRecords;
                this.pageSize = albumsMetaData.pageSize;
                this.totalNumberOfPages = Math.ceil(this.totalNumberOfAlbums / this.pageSize);
            });
    }

    public getTotalAlbumsText(): string {
        let text = this.totalNumberOfAlbums + ' (' + this.totalNumberOfPages;
        text += this.totalNumberOfPages === 1 ? ' page)' : ' pages)';
        return text;
    }

    public addAlbum(): void {
        this.mcCommunicationOut.emit({
            action: 'addAlbum',
        });
    }

    public ngOnDestroy(): void {
        this.metaDataSubscription.unsubscribe();
    }

    public search(): void {
        const page = this.headerForm.controls['page'].value;
        const keywords = this.headerForm.controls['keywords'].value;
        if (NumberUtility.isInt(page)) {
            this.mcCommunicationOut.emit({
                action: 'search',
                page: Number(page),
                keywords,
            });
        }
    }

    public clear(): void {
        this.headerForm.controls['page'].setValue(1);
        this.headerForm.controls['keywords'].setValue('');
        this.search();
    }

    public trackEnter(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            event.stopPropagation();
            this.search();
        }
    }

    public removeOphans(): void {
        this.modal = this.modalService.getModal('modal1')
            .setMessage('Are you sure you want to delete all artists, formats, labels and genres')
            .setMessage(' that are not referenced on any albums?')
            .doCloseOnYes(false)
            .addYesButton(() => {
                Promise.all([
                    this.factoryHelper.removeOrphans('artist'),
                    this.factoryHelper.removeOrphans('format'),
                    this.factoryHelper.removeOrphans('label'),
                    this.factoryHelper.removeOrphans('genre'),
                ]).then(
                    (responseArray) => {
                        this.modal.close();
                        const modal = this.modalService.getModal('modal1')
                            .setMessage('Clean-up result', ['big'])
                            .newLine();
                        responseArray.forEach((response) => {
                            modal.setMessage('Number of ' + response.entity + 's deleted: ' + response.deleted);
                            modal.newLine();
                        });
                        modal.open();
                        this.mcCommunicationOut.emit({
                            action: 'removedOrphans',
                        });
                    },
                    (error) => {
                        this.modal.close();
                        this.modalService.getModal('modal1')
                            .setErrorMessage(error)
                            .open();
                    }
                );
            })
            .addNoButton(() => {
            });
        this.modal.open();
    }
}
