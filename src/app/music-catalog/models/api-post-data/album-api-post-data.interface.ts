export interface AlbumPostData {
    title?: string;
    year?: number;
    notes?: string;
    date_added?: string;
    image_thumb?: string;
    image?: string;
    artist_id?: number;
    format_id?: number;
    label_id?: number;
    genre_id?: number;
}
export interface AlbumPrePostData {
    title?: string;
    year?: number;
    notes?: string;
    date_added?: string;
    image_thumb?: string;
    image?: string;
    artist?: number;
    format?: number;
    label?: number;
    genre?: number;
}
