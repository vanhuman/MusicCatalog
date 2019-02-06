import { AlbumInterface } from './album.model.interface';

export type McAction = 'goToPage' | 'search' | 'edit' | 'delete' | 'loggedIn' | 'loggedOut';

export type McItem = AlbumInterface;

export interface McCommunication {
    action: McAction;
    item?: McItem;
    page?: number;
    keywords?: string;
}
