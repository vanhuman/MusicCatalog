export interface BaseApiResponse {
    debug?: DebugApiResponse;
    pagination: PaginationApiResponse;
    parameters?: ParametersApiResponse;
}

export interface DebugApiResponse {
    query: string;
}

export interface PaginationApiResponse {
    number_of_records: number;
    page: number;
    page_size: number;
    total_number_of_records: number;
}

export interface ParametersApiResponse {
    sortby: string;
    sortdirection: string;
    artist_id?: string;
    genre_id?: string;
    format_id?: string;
    label_id?: string;
}
