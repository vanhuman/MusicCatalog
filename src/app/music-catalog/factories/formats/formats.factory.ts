import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';
import { HttpErrorResponse, HttpParams } from '@angular/common/http';
import { AuthenticationServiceInterface } from '../../services/authentication.service.interface';
import { ApiRequestServiceInterface } from '../../services/api-request.service.interface';
import { FormatInterface } from '../../models/format.model.interface';
import { FormatsFactoryState } from './formats.factory.state';
import { FormatApiResponse, FormatsApiResponse } from '../../models/api-responses/formats-api-response.interface';
import { ModalServiceInterface } from '../../services/modal.service.interface';
import { Format } from '../../models/format.model';
import { FormatsFactoryInterface } from './formats.factory.interface';

@Injectable()
export class FormatsFactory implements FormatsFactoryInterface {

    public constructor(
        private authenticationService: AuthenticationServiceInterface,
        private apiRequestService: ApiRequestServiceInterface,
        private state: FormatsFactoryState,
        private modalService: ModalServiceInterface,
    ) {
        //
    }

    public searchFormatsInCache(keyword: string): FormatInterface[] {
        return this.state.getCacheAsArray()
            .filter((format) => {
                return format.getName().toLowerCase().indexOf(keyword.toLowerCase()) !== -1;
            });
    }

    public getFormatsFromAPI(page: number): Observable<FormatInterface[]> {
        const observable: Subject<FormatInterface[]> = new Subject<FormatInterface[]>();
        const token = this.authenticationService.getToken();
        let params = new HttpParams();
        params = params.set('token', token);
        params = params.set('page', page.toString());
        // if the request is for all formats and we have some in cache, return the cache
        if (page === 0 && this.state.getCacheAsArray().length > 0) {
            return of(this.sortFormats(this.state.getCacheAsArray()));
        }
        this.apiRequestService.get<FormatsApiResponse>('/formats', params).subscribe({
            next: (response) => {
                const formats: FormatInterface[] = [];
                response.body.formats.forEach((formatApiResponse) => {
                    if (this.state.cache[formatApiResponse.id]) {
                        formats.push(this.updateFormat(this.state.cache[formatApiResponse.id], formatApiResponse));
                    } else {
                        const newFormat = this.newFormat(formatApiResponse);
                        formats.push(newFormat);
                        this.state.cache[newFormat.getId()] = newFormat;
                    }
                });
                observable.next(this.sortFormats(formats));
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

    public updateAndGetFormat(formatApiResponse: FormatApiResponse): FormatInterface {
        if (this.state.cache[formatApiResponse.id]) {
            this.updateFormat(this.state.cache[formatApiResponse.id], formatApiResponse);
        } else {
            this.state.cache[formatApiResponse.id] = this.newFormat(formatApiResponse);
        }
        return this.state.cache[formatApiResponse.id];
    }

    private sortFormats(formats: FormatInterface[]): FormatInterface[] {
        const sortFunc = (format1: FormatInterface, format2: FormatInterface) => {
            return format1.getName().toLowerCase() < format2.getName().toLowerCase() ? -1 : 1;
        };
        return formats.sort(sortFunc);
    }

    private newFormat(formatApiResponse: FormatApiResponse): FormatInterface {
        return new Format(
            formatApiResponse.id,
            formatApiResponse.name,
            formatApiResponse.description,
        );
    }

    private updateFormat(format: FormatInterface, formatApiResponse: FormatApiResponse): FormatInterface {
        format.setName(formatApiResponse.name);
        return format;
    }
}
