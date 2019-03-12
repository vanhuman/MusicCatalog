import { GenreInterface } from './genre.model.interface';

export class Genre implements GenreInterface {
    public constructor(
        private id: number,
        private description: string,
        private notes: string,
    ) {
        //
    }

    public getName(): string {
        return this.description;
    }

    public getDescription(): string {
        return this.description;
    }

    public setDescription(description: string): void {
        this.description = description;
    }

    public getNotes(): string {
        return this.notes;
    }

    public setNotes(notes: string): void {
        this.notes = notes;
    }

}
