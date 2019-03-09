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

interface AlbumFieldSettings {
    validators?: ValidatorFn[];
    placeholder?: string;
}

@Component({
    selector: 'music-catalog-album-edit',
    templateUrl: './album-edit.component.html',
    styleUrls: ['./album-edit.component.css']
})
export class AlbumEditComponent implements OnInit, OnDestroy {
    @Output() mcCommunication: EventEmitter<McCommunication> = new EventEmitter<McCommunication>();
    @ViewChild('artistsList') artistsList: ElementRef;

    public id = 'music-catalog-album-edit';
    public albumEditForm = new FormGroup({});
    public albumFields: Map<string, AlbumFieldSettings> = new Map<string, AlbumFieldSettings>();
    public artists: ArtistInterface[] = [];
    public labels: LabelInterface[] = [];
    public formats: FormatInterface[] = [];
    public genre: GenreInterface[] = [];
    public displayArtistsList = false;
    public previousImage = ImageUtility.imagePath + 'previous.png';
    public nextImage = ImageUtility.imagePath + 'next.png';

    private selectedArtistNumber = -1;
    private _album: AlbumInterface;

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

        // const keyHandlings = [
        //     {
        //         keyStroke: <KeyCode>'Enter',
        //         function: () => this.save.apply(this),
        //     },
        //     {
        //         keyStroke: <KeyCode>'Escape',
        //         function: () => this.cancel.apply(this),
        //     },
        // ];
        // KeyStrokeUtility.addListener(keyHandlings);
    }

    public ngOnDestroy(): void {
        // KeyStrokeUtility.removeListener();
    }

    public save(): void {
        // set date_added
    }

    public cancel(): void {
        this.mcCommunication.emit({
            action: 'cancel',
        });
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
        if (event.key === 'ArrowDown') {
            this.selectedArtistNumber = (this.selectedArtistNumber + 1) % this.artists.length;
        } else if (event.key === 'ArrowUp') {
            this.selectedArtistNumber = (this.selectedArtistNumber - 1) % this.artists.length;
            if (this.selectedArtistNumber < 0) {
                this.selectedArtistNumber = this.selectedArtistNumber + this.artists.length;
            }
        } else if (event.key === 'Enter') {
            if (this.selectedArtistNumber > -1) {
                this.selectArtist(this.artists[this.selectedArtistNumber]);
            }
        } else if (event.key === 'Escape') {
            this.artists = [];
            this.displayArtistsList = false;
            this.selectedArtistNumber = -1;
        } else if (input.length > 2) {
            this.selectedArtistNumber = -1;
            this.artists = this.artistsFactory.searchArtists(input);
            this.displayArtistsList = this.artists.length > 0;
        } else {
            this.displayArtistsList = false;
            this.selectedArtistNumber = -1;
            this.artists = [];
        }
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

    public selectArtist(artist: ArtistInterface): void {
        this.displayArtistsList = false;
        this.albumEditForm.controls['artist'].setValue(artist.getName());
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
            return 'The maximum length is' + maxLength + '.';
        } else if (this.albumEditForm.controls[fieldKey].errors.pattern) {
            return 'The format should be yyyy.';
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
}
