import { Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild } from '@angular/core';
import { AlbumInterface } from '../../models/album.model.interface';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { McCommunication } from '../../models/music-catalog-communication.interface';
import { ArtistInterface } from '../../models/artist.model.interface';
import { LabelInterface } from '../../models/label.model.interface';
import { FormatInterface } from '../../models/format.model.interface';
import { GenreInterface } from '../../models/genre.model.interface';
import { ArtistsFactoryInterface } from '../../factories/artists/artists.factory.interface';
import { KeyCode, KeyStrokeUtility } from '../../utilities/key-stroke.utility';
import { ImageUtility } from '../../utilities/image.utility';
import { NumberUtility } from '../../utilities/number.utility';
import { StringUtility } from '../../utilities/string.utility';
import { Configuration } from '../../configuration';

interface AlbumFieldSettings {
    validators?: ValidatorFn[];
    placeholder?: string;
}

type Entities = 'none' | 'artist' | 'label' | 'genre' | 'format';

@Component({
    selector: 'music-catalog-album-edit',
    templateUrl: './album-edit.component.html',
    styleUrls: ['./album-edit.component.css']
})
export class AlbumEditComponent implements OnInit, OnDestroy {
    @Output() mcCommunication: EventEmitter<McCommunication> = new EventEmitter<McCommunication>();

    public id = 'music-catalog-album-edit';
    public albumEditForm = new FormGroup({});
    public albumFields: Map<string, AlbumFieldSettings> = new Map<string, AlbumFieldSettings>();
    public artists: ArtistInterface[] = [];
    public labels: LabelInterface[] = [];
    public formats: FormatInterface[] = [];
    public genre: GenreInterface[] = [];
    public entityPopup: Entities = 'none';
    public previousImage = ImageUtility.imagePath + 'previous.png';
    public nextImage = ImageUtility.imagePath + 'next.png';
    public error = '';
    public showImages = Configuration.SHOW_IMAGES;

    private selectedEntityNumber = -1;
    private _album: AlbumInterface;
    private originalFormData: any;

    @Input()
    public set album(album: AlbumInterface) {
        this._album = album;
        this.displayAlbumInForm();
    }

    public get album(): AlbumInterface {
        return this._album;
    }

    public constructor(
        private artistsFactory: ArtistsFactoryInterface,
    ) {
        this.getRelatedEntities();
        this.defineAlbumFields();
        this.addFormControls();
    }

    public ngOnInit(): void {
        this.displayAlbumInForm();

        const keyHandlings = [
            {
                keyStroke: <KeyCode>'Escape',
                function: () => this.cancel.apply(this, [true]),
            },
        ];
        KeyStrokeUtility.addListener(keyHandlings);
    }

    public ngOnDestroy(): void {
        KeyStrokeUtility.removeListener();
    }

    public save(): void {
        if (this.entityPopup === 'none') {
            console.log(this.albumEditForm.valid);
            if (!this.albumEditForm.valid) {
                let errors = 'Error:';
                for (const key of Object.keys(this.albumEditForm.controls)) {
                    if (this.albumEditForm.controls[key].errors) {
                        errors = errors + ' ' + this.getValidationMessage(key);
                    }
                }
                this.error = errors;
            }
            // set date_added
            //
        }
    }

    public cancel(checkPopupVisible: boolean = false): void {
        // check form changed
        //
        if (!checkPopupVisible || this.entityPopup === 'none') {
            this.mcCommunication.emit({
                action: 'cancel',
            });
        }
    }

    public previousAlbum(): void {
        this.mcCommunication.emit({
            item: this.album,
            action: 'previous',
        });
    }

    public nextAlbum(): void {
        this.mcCommunication.emit({
            item: this.album,
            action: 'next',
        });
    }

    public processKeyupOnArtist(input: string, event: KeyboardEvent): void {
        if (event.key === 'Tab') {
            return;
        }
        if (this.entityPopup !== 'artist') {
            this.entityPopup = 'artist';
            this.selectedEntityNumber = -1;
        }
        if (event.key === 'ArrowDown') {
            this.selectedEntityNumber = (this.selectedEntityNumber + 1) % this.artists.length;
        } else if (event.key === 'ArrowUp') {
            this.selectedEntityNumber = (this.selectedEntityNumber - 1) % this.artists.length;
            if (this.selectedEntityNumber < 0) {
                this.selectedEntityNumber = this.selectedEntityNumber + this.artists.length;
            }
        } else if (event.key === 'Enter') {
            if (this.selectedEntityNumber > -1) {
                this.selectArtist(this.artists[this.selectedEntityNumber]);
            }
        } else if (event.key === 'Escape') {
            this.artists = [];
            this.entityPopup = 'none';
            this.selectedEntityNumber = -1;
        } else if (input.length > 2) {
            this.selectedEntityNumber = -1;
            this.artists = this.artistsFactory.searchArtists(input);
            this.entityPopup = this.artists.length > 0 ? 'artist' : 'none';
        } else {
            this.entityPopup = 'none';
            this.selectedEntityNumber = -1;
            this.artists = [];
        }
    }

    public selectArtist(artist: ArtistInterface): void {
        this.entityPopup = 'none';
        this.selectedEntityNumber = -1;
        this.albumEditForm.controls['artist'].setValue(artist.getName());
    }

    public processKeyupOnYear(input: string, event: KeyboardEvent): void {
        if (NumberUtility.isInt(input)) {
            let year: number;
            if (event.key === 'ArrowDown') {
                year = Number(input) - 1;
                this.albumEditForm.controls['year'].setValue(year);
            } else if (event.key === 'ArrowUp') {
                year = Number(input) + 1;
                this.albumEditForm.controls['year'].setValue(year);
            }
        }
    }

    public fieldError(fieldKey: string): boolean {
        return this.albumFields.get(fieldKey) &&
            this.albumEditForm.controls[fieldKey].errors && this.albumEditForm.controls[fieldKey].touched;
    }

    public getValidationMessage(fieldKey: string): string {
        if (this.albumEditForm.controls[fieldKey].errors.required) {
            return 'This is a mandatory field.';
        } else if (this.albumEditForm.controls[fieldKey].errors.maxlength) {
            const maxLength = this.albumEditForm.controls[fieldKey].errors.maxlength.requiredLength;
            return 'The maximum length is ' + maxLength + '.';
        } else if (this.albumEditForm.controls[fieldKey].errors.pattern) {
            return 'This should be a valid year.';
        }
        return 'Unknown validation error.';
    }

    private getRelatedEntities(): void {
        this.artistsFactory.getArtists(0);
    }

    private displayAlbumInForm(): void {
        this.albumEditForm.controls['title'].setValue(this.album.getTitle());
        this.albumEditForm.controls['year'].setValue(this.album.getYear());
        this.albumEditForm.controls['notes'].setValue(this.album.getNotes());
        this.albumEditForm.controls['artist'].setValue(this.album.getArtist().getName());
        this.originalFormData = this.albumEditForm.value;
        this.error = '';
    }

    private defineAlbumFields(): void {
        this.albumFields.set('title', {
            validators: [Validators.required, Validators.maxLength(255)],
        });
        this.albumFields.set('year', {
            validators: [Validators.required, Validators.pattern('^(19|20)\\d{2}$')],
            placeholder: 'yyyy',
        });
        this.albumFields.set('notes', {
            validators: [Validators.maxLength(2048)],
        });
        this.albumFields.set('artist', {
            validators: [Validators.required, Validators.maxLength(255)],
            placeholder: '(start typing for suggestions)',
        });
        this.albumFields.set('format', {
            validators: [Validators.required, Validators.maxLength(255)],
            placeholder: 'Format',
        });
        this.albumFields.set('label', {
            validators: [Validators.required, Validators.maxLength(255)],
            placeholder: 'Label',
        });
        this.albumFields.set('genre', {
            validators: [Validators.required, Validators.maxLength(255)],
            placeholder: 'Genre',
        });
    }

    private addFormControls(): void {
        this.albumFields.forEach((albumFieldSettings, name) => {
            this.albumEditForm.addControl(name, new FormControl());
            this.albumEditForm.controls[name].setValidators(albumFieldSettings.validators);
        });
    }

    private formHasChanged(): boolean {
        for (const formKey of Object.keys(this.albumEditForm.value)) {
            let value = this.albumEditForm.value[formKey];
            for (const orignalFormKey of Object.keys(this.originalFormData)) {
                if (formKey === orignalFormKey) {
                    let originalValue = this.originalFormData[orignalFormKey];
                    // regard '' as null
                    originalValue = originalValue === '' ? null : originalValue;
                    value = value === '' ? null : value;
                    if (originalValue !== value) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

}
