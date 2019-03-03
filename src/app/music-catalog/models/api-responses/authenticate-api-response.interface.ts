interface AuthenticateApiResponseSession {
    id: number;
    time_out: number;
    token: string;
    user_id: number;
}

interface AuthenticateApiResponseUser {
    id: number;
    username: string;
}

export interface AuthenticateApiResponse {
    session: AuthenticateApiResponseSession;
    user: AuthenticateApiResponseUser;
}
