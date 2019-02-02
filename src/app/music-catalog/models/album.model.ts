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

    public getYear(): number {
        return this.year;
    }

    public getDateAdded(): string {
        return this.dateAdded.toLocaleDateString('nl-NL');
    }

    public getNotes(): string {
        return this.notes;
    }

    public getArtist(): ArtistInterface {
        return this.artist;
    }

    public getFormat(): FormatInterface {
        return this.format;
    }

    public getLabel(): LabelInterface {
        return this.label;
    }

    public getGenre(): GenreInterface {
        return this.genre;
    }
}
