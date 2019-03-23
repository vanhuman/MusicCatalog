import {
    AfterViewInit, Component, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, ViewChild
} from '@angular/core';
import { AlbumInterface } from '../../models/album.model.interface';
import { FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { McCommunication } from '../../models/music-catalog-communication.interface';
import { ArtistInterface } from '../../models/artist.model.interface';
import { LabelInterface } from '../../models/label.model.interface';
import { FormatInterface } from '../../models/format.model.interface';
import { GenreInterface } from '../../models/genre.model.interface';
import { ArtistsFactoryInterface } from '../../factories/artists/artists.factory.interface';
import { KeyCode, KeyStrokeUtility } from '../../utilities/key-stroke.utility';
import { NumberUtility } from '../../utilities/number.utility';
import { Configuration } from '../../configuration';
import { FormCloseService } from '../../services/form-close.service';
import { BehaviorSubject } from 'rxjs';
import { FormatsFactoryInterface } from '../../factories/formats/formats.factory.interface';
import { LabelsFactoryInterface } from '../../factories/labels/labels.factory.interface';
import { GenresFactoryInterface } from '../../factories/genres/genres.factory.interface';
import { AlbumPostData } from '../../models/api-post-data/album-api-post-data.interface';
import { AlbumsFactoryInterface } from '../../factories/albums/albums.factory.interface';

interface AlbumFieldSettings {
    validators?: ValidatorFn[];
    placeholder?: string;
}

type EntityType = 'none' | 'artist' | 'label' | 'genre' | 'format';
type Entity = ArtistInterface | FormatInterface | LabelInterface | GenreInterface;

@Component({
    selector: 'music-catalog-album-edit',
    templateUrl: './album-edit.component.html',
    styleUrls: ['./album-edit.component.css']
})
export class AlbumEditComponent implements OnInit, OnDestroy, AfterViewInit {
    @Output() mcCommunication: EventEmitter<McCommunication> = new EventEmitter<McCommunication>();
    @ViewChild('title') public title: ElementRef;

    public id = 'music-catalog-album-edit';
    public albumEditForm = new FormGroup({});
    public albumFields: Map<string, AlbumFieldSettings> = new Map<string, AlbumFieldSettings>();
    public artists: ArtistInterface[] = [];
    public labels: LabelInterface[] = [];
    public formats: FormatInterface[] = [];
    public genres: GenreInterface[] = [];
    public entityPopup: EntityType = 'none';
    public previousImage = Configuration.IMAGE_PATH + 'previous.png';
    public nextImage = Configuration.IMAGE_PATH + 'next.png';
    public error = '';
    public showImages = Configuration.SHOW_IMAGES;

    private selectedEntityNumber = -1;
    private _album: AlbumInterface;
    private originalFormData: any;
    private keyHandlings = [
        {
            keyStroke: <KeyCode>'Escape',
            function: () => this.cancel.apply(this, [true]),
        },
    ];

    @Input()
    public set album(album: AlbumInterface) {
        this._album = album;
        if (this._album) {
            this.displayAlbumInForm();
        }
    }

    public get album(): AlbumInterface {
        return this._album;
    }

    public constructor(
        private artistsFactory: ArtistsFactoryInterface,
        private formatsFactory: FormatsFactoryInterface,
        private labelsFactory: LabelsFactoryInterface,
        private genresFactory: GenresFactoryInterface,
        private formCloseService: FormCloseService,
        private albumFactory: AlbumsFactoryInterface,
    ) {
        this.getRelatedEntities();
        this.defineAlbumFields();
        this.addFormControls();
    }

    public ngOnInit(): void {
        if (this._album) {
            this.displayAlbumInForm();
        }
        KeyStrokeUtility.addListener(this.keyHandlings);
    }

    public ngOnDestroy(): void {
        KeyStrokeUtility.removeListener();
    }

    public ngAfterViewInit(): void {
        this.title.nativeElement.focus();
    }

    public save(): void {
        if (this.entityPopup === 'none') {
            if (this.albumEditForm.valid) {
                Promise.all([
                    this.getRelatedId('artist'),
                    this.getRelatedId('format'),
                    this.getRelatedId('label'),
                    this.getRelatedId('genre'),
                ]).then(
                    ([artistId, formatId, labelId, genreId]) => {
                        console.log(labelId);
                        const albumPostData: AlbumPostData = {
                            title: this.albumEditForm.controls['title'].value,
                            year: this.albumEditForm.controls['year'].value,
                            notes: this.albumEditForm.controls['notes'].value,
                            artist_id: artistId,
                            format_id: formatId,
                            label_id: labelId,
                            genre_id: genreId,
                        };
                        let observable;
                        if (this.album) {
                            observable = this.albumFactory.putAlbum(albumPostData, this.album);
                        } else {
                            observable = this.albumFactory.postAlbum(albumPostData);
                        }
                        observable.subscribe((album: AlbumInterface) => {
                            this.mcCommunication.emit({
                                action: 'saved',
                                item: album,
                            });
                            this.formCloseService.reset();
                        });
                    }
                );
            }
        }
    }

    public cancel(checkPopupVisible: boolean = false): void {
        if (!checkPopupVisible || this.entityPopup === 'none') {
            this.formCloseService.checkIfCanClose().then((canClose) => {
                if (canClose) {
                    this.mcCommunication.emit({
                        action: 'close',
                    });
                }
            });
        }
    }

    public previousAlbum(): void {
        this.formCloseService.checkIfCanClose().then((canClose) => {
            if (canClose) {
                this.mcCommunication.emit({
                    item: this.album,
                    action: 'previous',
                });
            }
        });
    }

    public nextAlbum(): void {
        this.formCloseService.checkIfCanClose().then((canClose) => {
            if (canClose) {
                this.mcCommunication.emit({
                    item: this.album,
                    action: 'next',
                });
            }
        });
    }

    public processKeyupOnEntity(entityType: EntityType, input: string, event: KeyboardEvent): void {
        if (event.key === 'Tab') {
            this.clearAllEntities();
            this.entityPopup = 'none';
            this.selectedEntityNumber = -1;
            return;
        }
        let entities: Entity[];
        let inputMinLength = 2;
        switch (entityType) {
            case 'artist':
                entities = this.artists;
                break;
            case 'format':
                entities = this.formats;
                inputMinLength = 0;
                break;
            case 'label':
                entities = this.labels;
                break;
            case 'genre':
                entities = this.genres;
                break;
            default:
                break;
        }
        if (this.entityPopup !== entityType) {
            this.entityPopup = entityType;
            this.selectedEntityNumber = -1;
        }
        if (event.key === 'ArrowDown') {
            this.selectedEntityNumber = (this.selectedEntityNumber + 1) % entities.length;
        } else if (event.key === 'ArrowUp') {
            this.selectedEntityNumber = (this.selectedEntityNumber - 1) % entities.length;
            if (this.selectedEntityNumber < 0) {
                this.selectedEntityNumber = this.selectedEntityNumber + entities.length;
            }
        } else if (event.key === 'Enter') {
            if (this.selectedEntityNumber > -1) {
                this.selectEntity(entityType, entities[this.selectedEntityNumber]);
            } else if (entities.length > 0) {
                this.selectEntity(entityType, entities[0]);
            }
        } else if (event.key === 'Escape') {
            this.clearAllEntities();
            this.entityPopup = 'none';
            this.selectedEntityNumber = -1;
        } else if (input.length > inputMinLength) {
            entities = this.searchEntity(entityType, input);
            this.entityPopup = entities.length > 0 ? entityType : 'none';
            this.selectedEntityNumber = -1;
        } else {
            this.clearAllEntities();
            this.entityPopup = 'none';
            this.selectedEntityNumber = -1;
        }
    }

    public selectEntity(entityType: EntityType, entity: Entity): void {
        this.entityPopup = 'none';
        this.selectedEntityNumber = -1;
        this.albumEditForm.controls[entityType].setValue(entity.getName());
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

    public saveDisabled(): boolean {
        return this.entityPopup !== 'none' || !this.albumEditForm.valid;
    }

    public getClassForWidth(): string {
        return !Configuration.SHOW_IMAGES ? 'small' : '';
    }

    private clearAllEntities(): void {
        this.artists = [];
        this.formats = [];
        this.labels = [];
        this.genres = [];
    }

    private getRelatedId(entityType: EntityType): Promise<number> {
        return new Promise((resolve) => {
            let value: string;
            let entity: Entity;
            switch (entityType) {
                case 'artist':
                    value = this.albumEditForm.controls['artist'].value;
                    if (!value) {
                        resolve(null);
                    }
                    if (!this.album || this.album.getArtist().getName() !== value) {
                        entity = this.artistsFactory.matchArtistInCache(value);
                        if (entity) {
                            resolve(entity.getId());
                        } else {
                            this.artistsFactory.postArtist({name: value}).subscribe({
                                next: (artist) => {
                                    resolve(artist.getId());
                                },
                            });
                        }
                    } else {
                        resolve(this.album.getArtist().getId());
                    }
                    break;
                case 'format':
                    value = this.albumEditForm.controls['format'].value;
                    if (!value) {
                        resolve(null);
                    }
                    if (!this.album || this.album.getFormat().getName() !== value) {
                        entity = this.formatsFactory.matchFormatInCache(value);
                        if (entity) {
                            resolve(entity.getId());
                        } else {
                            this.formatsFactory.postFormat({name: value}).subscribe({
                                next: (format) => {
                                    resolve(format.getId());
                                },
                            });
                        }
                    } else {
                        resolve(this.album.getFormat().getId());
                    }
                    break;
                case 'label':
                    value = this.albumEditForm.controls['label'].value;
                    if (!value) {
                        resolve(null);
                    }
                    if (!this.album || this.album.getLabel().getName() !== value) {
                        entity = this.labelsFactory.matchLabelInCache(value);
                        if (entity) {
                            resolve(entity.getId());
                        } else {
                            this.labelsFactory.postLabel({name: value}).subscribe({
                                next: (label) => {
                                    resolve(label.getId());
                                },
                            });
                        }
                    } else {
                        resolve(this.album.getLabel().getId());
                    }
                    break;
                case 'genre':
                    value = this.albumEditForm.controls['genre'].value;
                    if (!value) {
                        resolve(null);
                    }
                    if (!this.album || this.album.getGenre().getName() !== value) {
                        entity = this.genresFactory.matchGenreInCache(value);
                        if (entity) {
                            resolve(entity.getId());
                        } else {
                            this.genresFactory.postGenre({description: value}).subscribe({
                                next: (genre) => {
                                    resolve(genre.getId());
                                },
                            });
                        }
                    } else {
                        resolve(this.album.getGenre().getId());
                    }
                    break;
            }
        });
    }

    private searchEntity(entityType: EntityType, input: string): Entity[] {
        switch (entityType) {
            case 'artist':
                this.artists = this.artistsFactory.searchArtistsInCache(input);
                return this.artists;
            case 'format':
                this.formats = this.formatsFactory.searchFormatsInCache(input);
                return this.formats;
            case 'label':
                this.labels = this.labelsFactory.searchLabelsInCache(input);
                return this.labels;
            case 'genre':
                this.genres = this.genresFactory.searchGenresInCache(input);
                return this.genres;
            default:
                return [];
        }
    }

    private getRelatedEntities(): void {
        this.artistsFactory.getArtistsFromAPI(0);
        this.formatsFactory.getFormatsFromAPI(0);
        this.labelsFactory.getLabelsFromAPI(0);
        this.genresFactory.getGenresFromAPI(0);
    }

    private displayAlbumInForm(): void {
        this.configureFormCloseService();
        this.albumEditForm.controls['title'].setValue(this.album.getTitle());
        this.albumEditForm.controls['year'].setValue(this.album.getYear());
        this.albumEditForm.controls['notes'].setValue(this.album.getNotes());
        this.albumEditForm.controls['artist'].setValue(this.album.getArtist().getName());
        this.albumEditForm.controls['format'].setValue(this.album.getFormat().getName());
        this.albumEditForm.controls['label'].setValue(this.album.getLabel().getName());
        this.albumEditForm.controls['genre'].setValue(this.album.getGenre().getDescription());
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
        });
        this.albumFields.set('label', {
            validators: [Validators.maxLength(255)],
            placeholder: 'Label',
        });
        this.albumFields.set('genre', {
            validators: [Validators.maxLength(255)],
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

    private configureFormCloseService(): void {
        this.formCloseService.configureOnClose({
            formCanCloseCallback: () => new BehaviorSubject(<boolean>(!this.formHasChanged())),
        });
    }
}
