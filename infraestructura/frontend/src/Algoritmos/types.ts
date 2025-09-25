export interface DataPoint {
    timestamp: string;
    [key: string]: any;
}

export interface PredictionPoint {
    step: number;
    timestamp: string;
    value: number;
}

export interface AlgorithmResult {
    variable: string;
    algorithm: string;
    predictions: PredictionPoint[];
    [key: string]: any;
}