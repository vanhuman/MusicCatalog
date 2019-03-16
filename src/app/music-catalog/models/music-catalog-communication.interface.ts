import { AlbumInterface } from './album.model.interface';

export type McAction = 'search' | 'editAlbum' | 'addAlbum' | 'deleteAlbum' | 'loggedIn' | 'loggedOut'
    | 'sort' | 'close' | 'previous' | 'next' | 'saved';

export type McItem = AlbumInterface;

export interface McCommunication {
    action: McAction;
    item?: McItem;
    page?: number;
    keywords?: string;
}
