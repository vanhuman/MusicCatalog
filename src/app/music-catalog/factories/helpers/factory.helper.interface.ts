import { EntityType } from '../../models/entity.interface';
import { RemoveOrphanApiResponse } from '../../models/api-responses/remove-orphan-api-response.interface';

export abstract class FactoryHelperInterface {
    public abstract removeOrphans(entity: EntityType): Promise<RemoveOrphanApiResponse>;
    public abstract getRelatedEntities(forced?: boolean): void;
}
