import * as moment from 'moment';
import { AlbumInterface } from './album.model.interface';
import { ArtistInterface } from './artist.model.interface';
import { FormatInterface } from './format.model.interface';
import { LabelInterface } from './label.model.interface';
import { GenreInterface } from './genre.model.interface';
import { Configuration } from '../configuration';

export class Album implements AlbumInterface {
    private deleted = false;

    public constructor(
        private id: number,
        private title: string,
        private year: number,
        private dateAdded: Date,
        private notes: string,
        private imageThumb: string,
        private imageThumbLocal: string,
        private image: string,
        private imageLocal: string,
        private imageFetchTimestamp: Date,
        private artist: ArtistInterface,
        private format: FormatInterface,
        private label: LabelInterface,
        private genre: GenreInterface,
        private imageLock: boolean,
    ) {
        //
    }

    public getId(): number {
        return this.id;
    }

    public getTitle(): string {
        return this.title;
    }

    public setTitle(title: string): void {
        this.title = title;
    }

    public getYear(): number {
        return this.year;
    }

    public setYear(year: number): void {
        this.year = year;
    }

    public getDateAdded(): string {
        return moment(this.dateAdded).format('DD-MM-YYYY');
    }

    public setDateAdded(dateAdded: Date): void {
        this.dateAdded = dateAdded;
    }

    public getNotes(): string {
        return this.notes;
    }

    public setNotes(notes: string): void {
        this.notes = notes;
    }

    public getImageThumb(): string {
        return this.imageThumbLocal
            ? Configuration.IMAGE_THUMB_PATH + this.imageThumbLocal
            : (this.imageThumb ? this.imageThumb : Configuration.IMAGE_THUMB_DEFAULT);
    }

    public setImageThumb(image: string): void {
        this.imageThumb = image;
    }

    public getImageThumbLocal(): string {
        return this.imageThumbLocal;
    }

    public setImageThumbLocal(image: string): void {
        this.imageThumbLocal = image;
    }

    public getImage(): string {
        return this.imageLocal ? Configuration.IMAGE_FULL_PATH + this.imageLocal : this.image;
    }

    public setImage(image: string): void {
        this.image = image;
    }

    public getImageLocal(): string {
        return this.imageLocal;
    }

    public setImageLocal(image: string): void {
        this.imageLocal = image;
    }

    public getArtist(): ArtistInterface {
        return this.artist;
    }

    public setArtist(artist: ArtistInterface): void {
        this.artist = artist;
    }

    public getFormat(): FormatInterface {
        return this.format;
    }

    public setFormat(format: FormatInterface): void {
        this.format = format;
    }

    public getLabel(): LabelInterface {
        return this.label;
    }

    public setLabel(label: LabelInterface): void {
        this.label = label;
    }

    public getGenre(): GenreInterface {
        return this.genre;
    }

    public setGenre(genre: GenreInterface): void {
        this.genre = genre;
    }

    public getImageFetchTimestamp(): Date {
        return this.imageFetchTimestamp;
    }

    public getImageFetchTimestampString(): string {
        return moment(this.imageFetchTimestamp).format('DD-MM-YYYY');
    }

    public setImageFetchTimestamp(imageFetchTimestamp: Date): void {
        this.imageFetchTimestamp = imageFetchTimestamp;
    }

    public setDeleted(deleted: boolean): void {
        this.deleted = deleted;
    }

    public getDeleted(): boolean {
        return this.deleted;
    }

    public getImageLock(): boolean {
        return this.imageLock;
    }

    public setImageLock(imageLock: boolean): void {
        this.imageLock = imageLock;
    }

}
