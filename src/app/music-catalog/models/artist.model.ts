import { ArtistInterface } from './artist.model.interface';

export class Artist implements ArtistInterface {
    public constructor(
        private id: number,
        private name: string,
    ) {
        //
    }

    public getName(): string {
        return this.name;
    }
}
