import { Injectable } from '@angular/core';
import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { RemoveOrphanApiResponse } from '../models/api-responses/remove-orphan-api-response.interface';
import { ApiRequestServiceInterface } from '../services/api-request.service.interface';
import { AuthenticationServiceInterface } from '../services/authentication.service.interface';
import { EntityType } from '../models/entity.interface';
import { FactoryHelperInterface } from './factory.helper.interface';
import { ArtistsFactoryInterface } from './artists/artists.factory.interface';
import { FormatsFactoryInterface } from './formats/formats.factory.interface';
import { LabelsFactoryInterface } from './labels/labels.factory.interface';
import { GenresFactoryInterface } from './genres/genres.factory.interface';

@Injectable()
export class FactoryHelper implements FactoryHelperInterface {
    public constructor(
        private apiRequestService: ApiRequestServiceInterface,
        private authenticationService: AuthenticationServiceInterface,
        private artistsFactory: ArtistsFactoryInterface,
        private formatsFactory: FormatsFactoryInterface,
        private labelsFactory: LabelsFactoryInterface,
        private genresFactory: GenresFactoryInterface,
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

    public getRelatedEntities(forced: boolean = false): void {
        this.artistsFactory.getArtistsFromAPI(0, forced);
        this.formatsFactory.getFormatsFromAPI(0, forced);
        this.labelsFactory.getLabelsFromAPI(0, forced);
        this.genresFactory.getGenresFromAPI(0, forced);
    }

}
