import { GenreInterface } from './genre.model.interface';

export class Genre implements GenreInterface {
    public constructor(
        private id: number,
        private description: string,
        private notes: string,
    ) {
        //
    }

    public getDescription(): string {
        return this.description;
    }
}
