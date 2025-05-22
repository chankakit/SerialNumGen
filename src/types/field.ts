export interface ValuePart {
    fixed: boolean;
    start: string;
    end: string;
    step: number;
    length: number;
    // validate(): boolean;
}

export interface Field {
    name: string;
    valueParts: ValuePart[];
    valueList: string[];
    // isValid(): boolean;
}
