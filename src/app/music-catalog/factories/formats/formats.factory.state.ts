import { Injectable } from '@angular/core';
import { FormatInterface } from '../../models/format.model.interface';

@Injectable()
export class FormatsFactoryState {
    public cache: { [id: number]: FormatInterface } = {};
    public retrievedAllFormats = false;

    public getCacheAsArray(): FormatInterface[] {
        return Object.keys(this.cache).map(key => this.cache[key]);
    }
}
