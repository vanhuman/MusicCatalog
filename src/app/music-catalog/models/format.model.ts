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

    public setName(name: string): void {
        this.name = name;
    }

    public getDescription(): string {
        return this.description;
    }

    public setDescription(description: string): void {
        this.description = description;
    }
}
