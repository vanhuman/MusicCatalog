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

export function isErrorApiResponse(object: any): object is ErrorApiResponse {
    if (object == null) {
        return false;
    }
    const errorApiResponse = <ErrorApiResponse> object;
    return errorApiResponse.error_code !== undefined &&
        errorApiResponse.error_type !== undefined &&
        errorApiResponse.message !== undefined &&
        errorApiResponse.reference !== undefined;
}

