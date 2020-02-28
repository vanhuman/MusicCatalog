import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { TooltipConfig } from './tooltip.directive';

declare var jQuery: any;

@Component({
    selector: 'shared-tooltip-component',
    template: `
        <div #tooltipContent class="tooltip-component-text">
            <span #tooltipArrowTop class="tooltip-arrow-top"></span>
            {{ tooltipConfig.title }}
            <span #tooltipArrowBottom class="tooltip-arrow-bottom"></span>
        </div>
    `,
    styleUrls: ['./tooltip.css'],
})
export class TooltipComponent implements AfterViewInit {
    @Input() public tooltipConfig: TooltipConfig;

    @ViewChild('tooltipContent', { static: false }) public tooltipContent: ElementRef;
    @ViewChild('tooltipArrowTop', { static: false }) public tooltipArrowTop: ElementRef;
    @ViewChild('tooltipArrowBottom', { static: false }) public tooltipArrowBottom: ElementRef;

    public ngAfterViewInit() {
        const targetElement = this.tooltipConfig.element.nativeElement;
        const targetElementOffset = jQuery(targetElement).offset();
        const tooltipElement = this.tooltipContent.nativeElement;
        const tooltipArrowTopElement = this.tooltipArrowTop.nativeElement;
        const tooltipArrowBottomElement = this.tooltipArrowBottom.nativeElement;

        // set initial left position
        let leftPosition: number;
        if (!this.tooltipConfig.centered) {
            leftPosition = targetElementOffset.left - tooltipElement.offsetWidth / 2;
        } else {
            leftPosition = targetElementOffset.left + targetElement.offsetWidth / 2 - tooltipElement.offsetWidth / 2;
        }
        // move tooltip to the left if it goes to the right out of screen; add a bit of space after the element
        const maxLeftPosition = window.innerWidth - tooltipElement.offsetWidth - 20;
        if (leftPosition > maxLeftPosition) {
            const leftShiftBottomArrow = (leftPosition - maxLeftPosition - 5) + 'px';
            const leftShiftTopArrow = (maxLeftPosition - leftPosition - 5) + 'px';
            jQuery(tooltipArrowBottomElement).css({'margin-left': leftShiftBottomArrow});
            jQuery(tooltipArrowTopElement).css({'margin-right': leftShiftTopArrow});
            leftPosition = maxLeftPosition;
        }
        // move tooltip to the right if it goes to the left out of screen
        if (leftPosition < 0) {
            const rightShiftBottomArrow = leftPosition - 10 + 'px';
            const rightShiftTopArrow = Math.abs(leftPosition) + 'px';
            jQuery(tooltipArrowBottomElement).css({'margin-left': rightShiftBottomArrow});
            jQuery(tooltipArrowTopElement).css({'margin-right': rightShiftTopArrow});
            leftPosition = 5;
        }
        leftPosition = leftPosition + this.tooltipConfig.leftOffset;
        jQuery(tooltipElement).css({left: leftPosition});

        // set top position
        const heightAboveElement = tooltipElement.offsetHeight + targetElement.offsetHeight;
        const topPosition = targetElementOffset.top - heightAboveElement;
        if (this.tooltipConfig.topOffsetAbsolute > 0) {
            jQuery(tooltipElement).css({position: 'fixed', top: this.tooltipConfig.topOffsetAbsolute + 'px'});
        } else {
            jQuery(tooltipElement).offset({top: topPosition + this.tooltipConfig.topOffset});
        }

        // set location of arrow
        jQuery('.tooltip-arrow-bottom').removeClass('show');
        jQuery('.tooltip-arrow-top').removeClass('show');
        if (this.tooltipConfig.arrowPositionVertical === 'top') {
            jQuery(tooltipArrowTopElement).addClass('show');
        } else {
            jQuery(tooltipArrowBottomElement).addClass('show');
        }

        // hide previous en show current
        jQuery('.tooltip-component-text').removeClass('show');
        jQuery(tooltipElement).addClass('show');
    }
}
