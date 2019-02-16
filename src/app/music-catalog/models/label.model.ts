import { LabelInterface } from './label.model.interface';

export class Label implements LabelInterface {
    public constructor(
        private id: number,
        private name: string,
    ) {
        //
    }

    public getName(): string {
        return this.name;
    }

    public setName(name: string): void {
        this.name = name;
    }
}
