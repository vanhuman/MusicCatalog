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
import { ModalServiceInterface } from '../../services/modal.service.interface';
import { StringUtility } from '../../utilities/string.utility';

interface AlbumFieldSettings {
    validators?: ValidatorFn[];
    placeholder?: string;
}

interface ChangeAllRefs {
    entity: EntityType;
    oldValue: string;
    newValue: string;
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
        private modalService: ModalServiceInterface,
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

    public preSave(): void {
        if (this.entityPopup === 'none') {
            const changeAllRefs: ChangeAllRefs[] = [];
            if (this.album && this.album.getArtist() && this.albumEditForm.controls['artist-all-refs'].value) {
                changeAllRefs.push({
                    entity: 'artist',
                    oldValue: this.album.getArtist().getName(),
                    newValue: this.albumEditForm.controls['artist'].value,
                });
            }
            if (this.album && this.album.getFormat() && this.albumEditForm.controls['format-all-refs'].value) {
                changeAllRefs.push({
                    entity: 'format',
                    oldValue: this.album.getFormat().getName(),
                    newValue: this.albumEditForm.controls['format'].value,
                });
            }
            if (this.album && this.album.getLabel() && this.albumEditForm.controls['label-all-refs'].value) {
                changeAllRefs.push({
                    entity: 'label',
                    oldValue: this.album.getLabel().getName(),
                    newValue: this.albumEditForm.controls['label'].value,
                });
            }
            if (this.album && this.album.getGenre() && this.albumEditForm.controls['genre-all-refs'].value) {
                changeAllRefs.push({
                    entity: 'genre',
                    oldValue: this.album.getGenre().getName(),
                    newValue: this.albumEditForm.controls['genre'].value,
                });
            }
            if (changeAllRefs.length > 0) {
                const modal = this.modalService.getModal('modal1')
                    .setMessage('Are you sure you want to change the following values')
                    .setMessage(' on all albums?', ['alert'])
                    .newLine()
                    .setWidth(500)
                    .addYesButton(() => {
                        this.save();
                    })
                    .addNoButton(() => {
                    });
                changeAllRefs.forEach((change) => {
                    modal.setMessage(StringUtility.capitalize(change.entity) + ' from ');
                    modal.setMessage(change.oldValue, ['big']);
                    modal.setMessage(' to ');
                    modal.setMessage(change.newValue, ['big']);
                    modal.newLine();
                });
                modal.open();
            } else {
                this.save();
            }
        }
    }

    public save(): void {
        if (this.albumEditForm.valid) {
            Promise.all([
                this.artistsFactory.getArtistIdFromValue(
                    this.album, this.albumEditForm.controls['artist'].value,
                    !!this.albumEditForm.controls['artist-all-refs'].value),
                this.formatsFactory.getFormatIdFromValue(
                    this.album, this.albumEditForm.controls['format'].value,
                    !!this.albumEditForm.controls['format-all-refs'].value),
                this.labelsFactory.getLabelIdFromValue(
                    this.album, this.albumEditForm.controls['label'].value,
                    !!this.albumEditForm.controls['label-all-refs'].value),
                this.genresFactory.getGenreIdFromValue(
                    this.album, this.albumEditForm.controls['genre'].value,
                    !!this.albumEditForm.controls['genre-all-refs'].value),
            ]).then(
                ([artistId, formatId, labelId, genreId]) => {
                    const albumPostData: AlbumPostData = {
                        title: this.albumEditForm.controls['title'].value,
                        year: this.albumEditForm.controls['year'].value,
                        notes: this.albumEditForm.controls['notes'].value,
                        artist_id: artistId,
                        format_id: formatId,
                        label_id: labelId !== null ? labelId : 0,
                        genre_id: genreId !== null ? genreId : 0,
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

    public cancel(checkPopupVisible: boolean = false): void {
        if (!checkPopupVisible || this.entityPopup === 'none') {
            this.formCloseService.checkIfCanClose().then((canClose) => {
                if (canClose) {
                    this.mcCommunication.emit({
                        action: 'close',
                    });
                }
            });
        } else {
            this.clearAllEntities();
            this.entityPopup = 'none';
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
        this.albumEditForm.controls['artist'].setValue(this.album.getArtist() ? this.album.getArtist().getName() : '');
        this.albumEditForm.controls['format'].setValue(this.album.getFormat() ? this.album.getFormat().getName() : '');
        this.albumEditForm.controls['label'].setValue(this.album.getLabel() ? this.album.getLabel().getName() : '');
        this.albumEditForm.controls['genre'].setValue(this.album.getGenre() ? this.album.getGenre().getDescription() : '');
        this.albumEditForm.controls['artist-all-refs'].setValue(false);
        this.albumEditForm.controls['format-all-refs'].setValue(false);
        this.albumEditForm.controls['label-all-refs'].setValue(false);
        this.albumEditForm.controls['genre-all-refs'].setValue(false);
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
        this.albumFields.set('artist-all-refs', {});
        this.albumFields.set('format-all-refs', {});
        this.albumFields.set('label-all-refs', {});
        this.albumFields.set('genre-all-refs', {});
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
                    if (formKey.indexOf('all-refs') === -1) {
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
        }
        return false;
    }

    private configureFormCloseService(): void {
        this.formCloseService.configureOnClose({
            formCanCloseCallback: () => new BehaviorSubject(<boolean>(!this.formHasChanged())),
        });
    }
}
