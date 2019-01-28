export class Session {

    public constructor(
        private id: number,
        private token: string,
        private timeOut: number,
        private userId: number,
    ) {
        //
    }

    public getToken(): string {
        return this.token;
    }

    public getTimeOut(): number {
        return this.timeOut;
    }

    public setTimeOut(timeOut: number): void {
        this.timeOut = timeOut;
    }

    public getUserId(): number {
        return this.userId;
    }

}
