import { ArtistInterface } from './artist.model.interface';

export class Artist implements ArtistInterface {
    public constructor(
        private id: number,
        private name: string,
    ) {
        //
    }

    public getId(): number {
        return this.id;
    }

    public setId(id: number) {
        this.id = id;
    }

    public getName(): string {
        return this.name;
    }

    public setName(name: string): void {
        this.name = name;
    }

    public getFullName(): string {
        const nameArray = this.name.split(',');
        let name = this.name;
        if (nameArray.length > 1) {
            name = nameArray[1].trim() + ' ' + nameArray[0].trim();
        }
        return name;
    }
}
