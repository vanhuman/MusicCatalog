export interface ArtistsApiResponse {
    artists: ArtistApiResponse;
}

export interface ArtistApiResponse {
    id: number;
    name: string;
}
