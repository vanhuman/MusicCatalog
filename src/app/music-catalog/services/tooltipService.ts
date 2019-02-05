import { Injectable } from '@angular/core';
import { TooltipConfig } from '../tooltip/tooltip.directive';

@Injectable()
export class TooltipService {
    public components: Map<number, TooltipConfig> = new Map();

    public tooltips(): TooltipConfig[] {
        return Array.from(this.components.values());
    }
}
