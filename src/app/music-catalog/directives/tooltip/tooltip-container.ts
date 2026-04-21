import { Component } from '@angular/core';
import { TooltipService } from '../../services/tooltipService';

@Component({
    selector: 'shared-tooltip-container',
    template: `
        <div class="tooltip-container">
          @for (tooltip of tooltipService.tooltips(); track tooltip) {
            <shared-tooltip-component
              [tooltipConfig]="tooltip">
            </shared-tooltip-component>
          }
        </div>`,
    standalone: false
})

export class TooltipContainerComponent {
    public tooltipService: TooltipService;

    constructor(tooltipService: TooltipService) {
        this.tooltipService = tooltipService;
    }
}
