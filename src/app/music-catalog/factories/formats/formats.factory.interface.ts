import { Observable } from 'rxjs';
import { FormatInterface } from '../../models/format.model.interface';
import { FormatApiResponse } from '../../models/api-responses/formats-api-response.interface';
import { FormatApiPostData } from '../../models/api-post-data/format-api-post-data.interface';
import { AlbumInterface } from '../../models/album.model.interface';

export abstract class FormatsFactoryInterface {
    public abstract getFormatsFromAPI(page: number): Observable<FormatInterface[]>;
    public abstract postFormat(formatApiPostData: FormatApiPostData): Observable<FormatInterface>;
    public abstract putFormat(format: FormatInterface, formatApiPostData: FormatApiPostData): Observable<FormatInterface>;
    public abstract searchFormatsInCache(keyword: string): FormatInterface[];
    public abstract updateAndGetFormat(formatApiResponse: FormatApiResponse): FormatInterface;
    public abstract matchFormatInCache(value: string): FormatInterface;
    public abstract getFormatIdFromValue(album: AlbumInterface, value: string, allReferences: boolean): Promise<number>;
}



