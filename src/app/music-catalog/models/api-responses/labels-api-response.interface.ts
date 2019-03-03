export interface LabelsApiResponse {
    labels: LabelApiResponse[];
}

export interface LabelApiResponse {
    id: number;
    name: string;
}
