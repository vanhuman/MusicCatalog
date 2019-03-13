import { Observable } from 'rxjs';
import { LabelInterface } from '../../models/label.model.interface';

export abstract class LabelsFactoryInterface {
    public abstract getLabels(page: number): Observable<LabelInterface[]>;

    public abstract searchLabels(keyword: string): LabelInterface[];
}
