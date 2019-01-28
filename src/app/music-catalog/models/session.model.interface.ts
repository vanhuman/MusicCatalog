export interface SessionInterface {
    getToken(): string;

    getTimeOut(): number;

    setTimeOut(timeOut: number): void;
}
