import { AlbumInterface } from './album.model.interface';

export type McAction = 'search' | 'edit' | 'delete' | 'loggedIn' | 'loggedOut'
    | 'sort' | 'cancel' | 'previous' | 'next';

export type McItem = AlbumInterface;

export interface McCommunication {
    action: McAction;
    item?: McItem;
    page?: number;
    keywords?: string;
}
