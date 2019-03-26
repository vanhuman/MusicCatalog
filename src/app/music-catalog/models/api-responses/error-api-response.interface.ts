interface ErrorType {
    id: number;
    description: string;
}

export interface ErrorApiResponse {
    error_code: number;
    error_type: ErrorType;
    message: string;
    reference: string;
}
