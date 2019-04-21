import { ArtistInterface } from './artist.model.interface';
import { FormatInterface } from './format.model.interface';
import { LabelInterface } from './label.model.interface';
import { GenreInterface } from './genre.model.interface';

export type EntityType = 'none' | 'artist' | 'label' | 'genre' | 'format';
export type Entity = ArtistInterface | FormatInterface | LabelInterface | GenreInterface;
