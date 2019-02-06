import { Injectable } from '@angular/core';

@Injectable()
export class NumberUtility {

    public static isInt(value): boolean {
        if (isNaN(value)) {
            return false;
        }
        const number = parseFloat(value);
        return (number | 0) === number;
    }
}
