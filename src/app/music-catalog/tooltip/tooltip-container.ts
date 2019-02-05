import { Component } from '@angular/core';
import { TooltipService } from '../services/tooltipService';

@Component({
    selector: 'shared-tooltip-container',
    template: `
        <div class="tooltip-container">
            <shared-tooltip-component
                    *ngFor="let tooltip of tooltipService.tooltips()" [tooltipConfig]="tooltip">
            </shared-tooltip-component>
        </div>`
})

export class TooltipContainerComponent {
    public tooltipService: TooltipService;

    constructor(tooltipService: TooltipService) {
        this.tooltipService = tooltipService;
    }
}
