import { Observable } from 'rxjs';
import { FormatInterface } from '../../models/format.model.interface';
import { FormatApiResponse } from '../../models/api-responses/formats-api-response.interface';

export abstract class FormatsFactoryInterface {
    public abstract getFormatsFromAPI(page: number): Observable<FormatInterface[]>;
    public abstract searchFormatsInCache(keyword: string): FormatInterface[];
    public abstract updateAndGetFormat(formatApiResponse: FormatApiResponse): FormatInterface;
}



