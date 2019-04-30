import { BaseApiResponse } from './base-api-response.interface';
import { FormatApiResponse } from './formats-api-response.interface';
import { ArtistApiResponse } from './artists-api-response.interface';
import { GenreApiResponse } from './genres-api-response.interface';
import { LabelApiResponse } from './labels-api-response.interface';

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
    image_fetch_timestamp: string;
    label: LabelApiResponse;
    notes: string;
    title: string;
    year: number;
}

