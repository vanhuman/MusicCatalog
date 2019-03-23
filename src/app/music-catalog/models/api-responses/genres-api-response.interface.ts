export interface GenresApiResponse {
    genres: GenreApiResponse[];
}

export interface GenreApiResponseWrapper {
    genre: GenreApiResponse;
}

export interface GenreApiResponse {
    id: number;
    description: string;
    notes: string;
}
