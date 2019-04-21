import { EntityType } from '../entity.interface';

export interface RemoveOrphanApiResponse {
    entity: EntityType;
    deleted: number;
}
