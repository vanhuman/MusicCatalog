import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { AuthenticationServiceInterface } from '../../services/authentication.service.interface';
import { ApiRequestServiceInterface } from '../../services/api-request.service.interface';
import { LabelInterface } from '../../models/label.model.interface';
import { LabelsFactoryState } from './labels.factory.state';
import { LabelApiResponse, LabelsApiResponse } from '../../models/api-responses/labels-api-response.interface';
import { ModalServiceInterface } from '../../services/modal.service.interface';
import { Label } from '../../models/label.model';
import { LabelsFactoryInterface } from './labels.factory.interface';
import { ArtistApiResponse } from '../../models/api-responses/artists-api-response.interface';
import { ArtistInterface } from '../../models/artist.model.interface';

@Injectable()
export class LabelsFactory implements LabelsFactoryInterface {

    public constructor(
        private authenticationService: AuthenticationServiceInterface,
        private apiRequestService: ApiRequestServiceInterface,
        private state: LabelsFactoryState,
        private modalService: ModalServiceInterface,
    ) {
        //
    }

    public searchLabelsInCache(keyword: string): LabelInterface[] {
        return this.state.getCacheAsArray()
            .filter((label) => {
                return label.getName().toLowerCase().indexOf(keyword.toLowerCase()) !== -1;
            });
    }

    public getLabelsFromAPI(page: number): Observable<LabelInterface[]> {
        const observable: Subject<LabelInterface[]> = new Subject<LabelInterface[]>();
        const token = this.authenticationService.getToken();
        let params = new HttpParams();
        params = params.set('token', token);
        params = params.set('page', page.toString());
        // if the request is for all labels and we have some in cache, return the cache
        if (page === 0 && this.state.getCacheAsArray().length > 0) {
            return of(this.sortLabels(this.state.getCacheAsArray()));
        }
        this.apiRequestService.get<LabelsApiResponse>('/labels', params).subscribe({
            next: (response) => {
                const labels: LabelInterface[] = [];
                response.body.labels.forEach((labelApiResponse) => {
                    if (this.state.cache[labelApiResponse.id]) {
                        labels.push(this.updateLabel(this.state.cache[labelApiResponse.id], labelApiResponse));
                    } else {
                        const newLabel = this.newLabel(labelApiResponse);
                        labels.push(newLabel);
                        this.state.cache[newLabel.getId()] = newLabel;
                    }
                });
                observable.next(this.sortLabels(labels));
            },
            error: (error: HttpErrorResponse) => {
                this.modalService.getModal('message-modal')
                    .setMessage(error.error.message)
                    .open();
                observable.error([]);
            }
        });
        return observable;
    }

    public updateAndGetLabel(labelApiResponse: LabelApiResponse): LabelInterface {
        if (this.state.cache[labelApiResponse.id]) {
            this.updateLabel(this.state.cache[labelApiResponse.id], labelApiResponse);
        } else {
            this.state.cache[labelApiResponse.id] = this.newLabel(labelApiResponse);
        }
        return this.state.cache[labelApiResponse.id];
    }

    private sortLabels(labels: LabelInterface[]): LabelInterface[] {
        const sortFunc = (label1: LabelInterface, label2: LabelInterface) => {
            return label1.getName().toLowerCase() < label2.getName().toLowerCase() ? -1 : 1;
        };
        return labels.sort(sortFunc);
    }

    private newLabel(labelApiResponse: LabelApiResponse): LabelInterface {
        return new Label(
            labelApiResponse.id,
            labelApiResponse.name,
        );
    }

    private updateLabel(label: LabelInterface, labelApiResponse: LabelApiResponse): LabelInterface {
        label.setName(labelApiResponse.name);
        return label;
    }
}
