export type ErrorReference = 'AuthenticationController';
export type ErrorType = 'ERROR' | 'INFORMATION';

export interface ErrorResponse {
    message: string;
    reference: ErrorReference;
    status: number;
    type: ErrorType;
}
