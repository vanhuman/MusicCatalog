import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { RemoveOrphanApiResponse } from '../models/api-responses/remove-orphan-api-response.interface';
import { ApiRequestServiceInterface } from '../services/api-request.service.interface';
import { AuthenticationServiceInterface } from '../services/authentication.service.interface';
import { EntityType } from '../models/entity.interface';
import { FactoryHelperInterface } from './factory.helper.interface';

@Injectable()
export class FactoryHelper implements FactoryHelperInterface {
    public constructor(
        private apiRequestService: ApiRequestServiceInterface,
        private authenticationService: AuthenticationServiceInterface,
    ) {
        //
    }

    public removeOrphans(entity: EntityType): Promise<RemoveOrphanApiResponse> {
        return new Promise<RemoveOrphanApiResponse>((resolve, reject) => {
            const headers = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
            const token = this.authenticationService.getToken();
            this.apiRequestService.delete<RemoveOrphanApiResponse>(
                '/' + entity + 's/remove_orphans?token=' + token,
                headers
            ).subscribe({
                next: (response) => {
                    resolve(response.body);
                },
                error: (error: HttpErrorResponse) => {
                    reject(error.error);
                }
            });
        });
    }
}
