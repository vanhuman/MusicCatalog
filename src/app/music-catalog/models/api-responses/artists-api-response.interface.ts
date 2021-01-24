export interface ArtistsApiResponse {
    artists: ArtistApiResponse[];
}

export interface ArtistApiResponseWrapper {
    artist: ArtistApiResponse;
}

export interface ArtistApiResponse {
    id: number;
    name: string;
}
