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

    public getFullName(): string {
        const nameArray = this.name.split(',');
        let name = this.name;
        if (nameArray.length > 1) {
            name = nameArray[1] + ' ' + nameArray[0];
        }
        return name;
    }
}
