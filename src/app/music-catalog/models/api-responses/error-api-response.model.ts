export type ErrorReference = 'AuthenticationController';

export type ErrorType = 'ERROR' | 'INFORMATION';

export const enum errorCode {
    authorisation = 1,
    unknown = 2,
}

export interface ErrorResponse {
    message: string;
    reference: ErrorReference;
    status: number;
    type: ErrorType;
    code: errorCode;
}
