import { ArtistInterface } from './artist.model.interface';
import { LabelInterface } from './label.model.interface';
import { GenreInterface } from './genre.model.interface';
import { FormatInterface } from './format.model.interface';

export interface AlbumInterface {
    getId(): number;
    getTitle(): string;
    setTitle(title: string): void;
    getYear(): number;
    setYear(year: number): void;
    getDateAdded(): string;
    setDateAdded(dateAdded: Date): void;
    getNotes(): string;
    setNotes(notes: string): void;
    getImageThumb(): string;
    setImageThumb(image: string): void;
    getImageThumbLocal(): string;
    setImageThumbLocal(image: string): void;
    getImage(): string;
    setImage(image: string): void;
    getImageLocal(): string;
    setImageLocal(image: string): void;
    getImageFetchTimestamp(): Date;
    getImageFetchTimestampString(): string;
    setImageFetchTimestamp(imageFetchTimestamp: Date): void;
    getArtist(): ArtistInterface;
    setArtist(artist: ArtistInterface): void;
    getFormat(): FormatInterface;
    setFormat(format: FormatInterface): void;
    getLabel(): LabelInterface;
    setLabel(label: LabelInterface): void;
    getGenre(): GenreInterface;
    setGenre(genre: GenreInterface): void;
    getDeleted(): boolean;
    setDeleted(deleted: boolean): void;
    isMissingImages(): boolean;
}
