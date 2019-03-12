import { Observable } from 'rxjs';
import { FormatInterface } from '../../models/format.model.interface';

export abstract class FormatsFactoryInterface {
    public abstract getFormats(page: number): Observable<FormatInterface[]>;

    public abstract searchFormats(keyword: string): FormatInterface[];
}



