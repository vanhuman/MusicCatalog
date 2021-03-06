import { AlbumInterface } from './album.model.interface';

export type McAction = 'search' | 'editAlbum' | 'addAlbum' | 'deleteAlbum' | 'loggedIn' | 'login' | 'logout'
    | 'sort' | 'close' | 'previous' | 'next' | 'saved' | 'getImage' | 'removedOrphans' | 'albumDeleted';

export type McItem = AlbumInterface;

export interface McCommunication {
    action: McAction;
    item?: McItem;
    page?: number;
    keywords?: string;
    fetchImage?: boolean;
}
