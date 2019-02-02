export interface FormatsApiResponse {
    formats: FormatApiResponse[];
}

export interface FormatApiResponse {
    id: number;
    name: string;
    description: string;
}
