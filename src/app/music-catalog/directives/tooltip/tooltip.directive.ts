import { Directive, ElementRef, HostListener, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { TooltipService } from '../../services/tooltipService';

export type ArrowPosition = 'top' | 'bottom';

export interface TooltipConfig {
    title: string;
    element?: ElementRef;
    disabled?: boolean;
    centered?: boolean;
    leftOffset?: number;
    topOffset?: number;
    topOffsetAbsolute?: number;
    arrowPositionVertical?: ArrowPosition;
}

@Directive({
    selector: '[sharedTooltip]',
})
export class TooltipDirective implements OnDestroy, OnChanges {
    public static tooltipConfigDefault: TooltipConfig = {
        title: '',
        disabled: false,
        centered: true,
        leftOffset: 0,
        topOffset: 0,
        topOffsetAbsolute: 0,
        arrowPositionVertical: 'bottom',
    };
    private hovering = false;

    @Input('sharedTooltip') public tooltipConfig: TooltipConfig;

    private id: number = null;

    constructor(private tooltipService: TooltipService, private element: ElementRef) {
        //
    }

    @HostListener('mouseenter')
    public onMouseEnter(): void {
        this.hovering = true;
        setTimeout(() => {
            if (!this.tooltipConfig.disabled && this.id === null && this.hovering) {
                this.id = (new Date()).valueOf() + Math.random();
                this.tooltipConfig.element = this.element;
                this.tooltipService.components.set(this.id, this.tooltipConfig);
            }
        }, 100);
    }

    @HostListener('mouseleave')
    public onMouseLeave(): void {
        this.hovering = false;
        if (!this.tooltipConfig.disabled) {
            this.destroy();
        }
    }

    @HostListener('click')
    public onClick(): void {
        this.destroy();
    }

    public ngOnDestroy(): void {
        this.destroy();
    }

    public ngOnChanges(changes: SimpleChanges): void {
        if (changes['tooltipConfig']) {
            Object.getOwnPropertyNames(TooltipDirective.tooltipConfigDefault).forEach((property) => {
                if (this.tooltipConfig[property] == null) {
                    this.tooltipConfig[property] = TooltipDirective.tooltipConfigDefault[property];
                }
            });
        }
    }

    private destroy() {
        if (this.id) {
            if (this.tooltipService.components.has(this.id)) {
                setTimeout(() => {
                    this.tooltipService.components.delete(this.id);
                    this.id = null;
                }, 200);
            }
        }
    }
}
