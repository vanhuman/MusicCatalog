import { BaseApiResponse } from './base-api-response.model';
import { FormatApiResponse } from './formats-api-response.model';
import { ArtistApiResponse } from './artists-api-response.model';
import { GenreApiResponse } from './genres-api-response.model';
import { LabelApiResponse } from './labels-api-response.model';

export interface AlbumsApiResponse extends BaseApiResponse {
    albums: AlbumApiResponse[];
}

export interface AlbumApiResponseWrapper {
    album: AlbumApiResponse;
}

export interface AlbumApiResponse {
    artist: ArtistApiResponse;
    date_added: string;
    format: FormatApiResponse;
    genre: GenreApiResponse;
    id: number;
    image_thumb: string;
    image: string;
    label: LabelApiResponse;
    notes: string;
    title: string;
    year: number;
}


