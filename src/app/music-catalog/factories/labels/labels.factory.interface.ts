import { Observable } from 'rxjs';
import { LabelInterface } from '../../models/label.model.interface';
import { LabelApiResponse } from '../../models/api-responses/labels-api-response.interface';
import { LabelApiPostData } from '../../models/api-post-data/label-api-post-data.interface';

export abstract class LabelsFactoryInterface {
    public abstract getLabelsFromAPI(page: number): Observable<LabelInterface[]>;
    public abstract postLabel(labelApiPostData: LabelApiPostData): Observable<LabelInterface>;
    public abstract searchLabelsInCache(keyword: string): LabelInterface[];
    public abstract updateAndGetLabel(labelApiResponse: LabelApiResponse): LabelInterface;
    public abstract matchLabelInCache(value: string): LabelInterface;
}
