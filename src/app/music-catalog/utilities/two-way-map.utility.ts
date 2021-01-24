export class TwoWayMap {
    private map: { [key: string]: string } = {};
    private reverseMap: { [key: string]: string } = {};

    constructor(map: { [key: string]: string } = {}) {
        this.map = map;
        this.reverseMap = {};
        for (const key of Object.keys(map)) {
            this.reverseMap[map[key]] = key;
        }
    }

    public get(key: string): string {
        if (this.map.hasOwnProperty(key)) {
            return this.map[key];
        }
        return null;
    }

    public reverseGet(key: string): string {
        if (this.reverseMap.hasOwnProperty(key)) {
            return this.reverseMap[key];
        }
        return null;
    }

    public getFirst(): string {
        if (Object.keys(this.map).length > 0) {
            return this.map[Object.keys(this.map)[0]];
        }
        return null;
    }

    public reverseGetFirst(): string {
        if (Object.keys(this.reverseMap).length > 0) {
            return this.reverseMap[Object.keys(this.reverseMap)[0]];
        }
        return null;
    }

    public length(): number {
        return Object.keys(this.map).length;
    }

    public keys(): string[] {
        return Object.keys(this.map);
    }

    public reverseKeys(): string[] {
        return Object.keys(this.reverseMap);
    }
}
