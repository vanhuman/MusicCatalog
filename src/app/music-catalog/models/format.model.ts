import { FormatInterface } from './format.model.interface';

export class Format implements FormatInterface {
    public constructor(
        private id: number,
        private name: string,
        private description: string,
    ) {
        //
    }

    public getName(): string {
        return this.name;
    }
}
