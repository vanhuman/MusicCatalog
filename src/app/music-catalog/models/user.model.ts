import { UserInterface } from './user.model.interface';

export class User implements UserInterface {
    public constructor(
        private id: number,
        private username: string,
        private admin: boolean,
    ) {
        //
    }

    public isAdmin(): boolean {
        return this.admin;
    }
}
