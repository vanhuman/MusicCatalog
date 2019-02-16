import * as moment from 'moment';
import { AlbumInterface } from './album.model.interface';
import { ArtistInterface } from './artist.model.interface';
import { FormatInterface } from './format.model.interface';
import { LabelInterface } from './label.model.interface';
import { GenreInterface } from './genre.model.interface';

export class Album implements AlbumInterface {
    public constructor(
        private id: number,
        private title: string,
        private year: number,
        private dateAdded: Date,
        private notes: string,
        private artist: ArtistInterface,
        private format: FormatInterface,
        private label: LabelInterface,
        private genre: GenreInterface,
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
}
