import { ArtistInterface } from './artist.model.interface';
import { LabelInterface } from './label.model.interface';
import { GenreInterface } from './genre.model.interface';
import { FormatInterface } from './format.model.interface';

export interface AlbumInterface {
    getId(): number;

    getTitle(): string;

    getYear(): number;

    getDateAdded(): string;

    getNotes(): string;

    getArtist(): ArtistInterface;

    getLabel(): LabelInterface;

    getGenre(): GenreInterface;

    getFormat(): FormatInterface;
}
