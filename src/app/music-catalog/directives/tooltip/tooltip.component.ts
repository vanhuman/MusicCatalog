import { AfterViewInit, Component, ElementRef, Input, ViewChild } from '@angular/core';
import { TooltipConfig } from './tooltip.directive';

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
    standalone: false
})
export class TooltipComponent implements AfterViewInit {
    @Input() public tooltipConfig: TooltipConfig;

    @ViewChild('tooltipContent') public tooltipContent: ElementRef;
    @ViewChild('tooltipArrowTop') public tooltipArrowTop: ElementRef;
    @ViewChild('tooltipArrowBottom') public tooltipArrowBottom: ElementRef;
    public ngAfterViewInit() {
        const targetElement = this.tooltipConfig.element.nativeElement;
        const targetElementTop = targetElement.getBoundingClientRect().top;
        const targetElementLeft = targetElement.getBoundingClientRect().left;
        const tooltipElement = this.tooltipContent.nativeElement;
        const tooltipArrowTopElement = this.tooltipArrowTop.nativeElement;
        const tooltipArrowBottomElement = this.tooltipArrowBottom.nativeElement;

        // set initial left position
        let leftPosition: number;
        if (!this.tooltipConfig.centered) {
            leftPosition = targetElementLeft - tooltipElement.offsetWidth / 2;
        } else {
            leftPosition = targetElementLeft + targetElement.offsetWidth / 2 - tooltipElement.offsetWidth / 2;
        }
        // move tooltip to the left if it goes to the right out of screen; add a bit of space after the element
        const maxLeftPosition = window.innerWidth - tooltipElement.offsetWidth - 20;
        if (leftPosition > maxLeftPosition) {
            const leftShiftBottomArrow = (leftPosition - maxLeftPosition - 5) + 'px';
            const leftShiftTopArrow = (maxLeftPosition - leftPosition - 5) + 'px';
            tooltipArrowBottomElement.style['margin-left'] = leftShiftBottomArrow;
            tooltipArrowBottomElement.style['margin-right'] = leftShiftTopArrow;
            leftPosition = maxLeftPosition;
        }
        // move tooltip to the right if it goes to the left out of screen
        if (leftPosition < 0) {
            const rightShiftBottomArrow = leftPosition - 10 + 'px';
            const rightShiftTopArrow = Math.abs(leftPosition) + 'px';
            tooltipArrowBottomElement.style['margin-left'] = rightShiftBottomArrow;
            tooltipArrowTopElement.style['margin-right'] = rightShiftTopArrow;
            leftPosition = 5;
        }
        leftPosition = leftPosition + this.tooltipConfig.leftOffset;
        tooltipElement.style['left'] = leftPosition + 'px';

        // set top position
        const heightAboveElement = tooltipElement.offsetHeight + targetElement.offsetHeight;
        const topPosition = targetElementTop - heightAboveElement;
        if (this.tooltipConfig.topOffsetAbsolute > 0) {
            tooltipElement.style.position = 'fixed';
            tooltipElement.style['top'] = this.tooltipConfig.topOffsetAbsolute + 'px';
        } else {
            tooltipElement.style['top'] = (topPosition + this.tooltipConfig.topOffset + 10) + 'px';
        }

        // set location of arrow
        tooltipArrowBottomElement.classList.remove('show');
        tooltipArrowTopElement.classList.remove('show');
        if (this.tooltipConfig.arrowPositionVertical === 'top') {
            tooltipArrowTopElement.classList.add('show');
        } else {
            tooltipArrowBottomElement.classList.add('show');
        }

        // hide previous en show current
        tooltipElement.classList.remove('show');
        tooltipElement.classList.add('show');
    }
}
