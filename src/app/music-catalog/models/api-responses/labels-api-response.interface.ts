export interface LabelsApiResponse {
    labels: LabelApiResponse[];
}

export interface LabelApiResponseWrapper {
    label: LabelApiResponse;
}

export interface LabelApiResponse {
    id: number;
    name: string;
}
