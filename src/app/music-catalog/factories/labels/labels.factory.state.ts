import { Injectable } from '@angular/core';
import { LabelInterface } from '../../models/label.model.interface';

@Injectable()
export class LabelsFactoryState {
    public cache: { [id: number]: LabelInterface } = {};

    public getCacheAsArray(): LabelInterface[] {
        return Object.keys(this.cache).map(key => this.cache[key]);
    }
}
